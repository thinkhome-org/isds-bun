// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import type { IsdsCapabilityPatch } from "../capabilities/index.ts";
import { IsdsAuthenticationError, IsdsConfigurationError } from "../errors/index.ts";

export interface RequestContext {
  readonly headers: Headers;
}

export interface ResponseContext {
  readonly response: Response;
}

export interface AuthContext {
  readonly profileName?: string;
}

export interface IsdsAuthenticationAdapter {
  readonly type: string;
  initialize(context: AuthContext): Promise<void>;
  decorateRequest(request: RequestContext): Promise<void>;
  handleResponse(response: ResponseContext): Promise<void>;
  capabilities(): Promise<IsdsCapabilityPatch>;
  close(): Promise<void>;
}

export type PasswordAuthentication =
  | {
      type: "password";
      username: string;
      password: string;
    }
  | {
      type: "password-secret";
      usernameSecret: string;
      passwordSecret: string;
      service?: string;
    };

export type IsdsAuthentication = PasswordAuthentication | { type: "none" };

export const DEFAULT_SECRET_SERVICE = "thinkhome-isds";

export interface IsdsSecretReference {
  readonly service: string;
  readonly name: string;
}

export interface IsdsSecretStore {
  get(reference: IsdsSecretReference): Promise<string | null>;
  set(reference: IsdsSecretReference, value: string): Promise<void>;
  delete(reference: IsdsSecretReference): Promise<boolean>;
}

type BunSecrets = {
  get?: (options: { service: string; name: string }) => Promise<string | null>;
  set?: (options: { service: string; name: string }, value: string) => Promise<void>;
  delete?: (options: { service: string; name: string }) => Promise<boolean>;
};

export class BunSecretStore implements IsdsSecretStore {
  #secrets(): BunSecrets | undefined {
    return (Bun as unknown as { secrets?: BunSecrets }).secrets;
  }

  async get(reference: IsdsSecretReference): Promise<string | null> {
    return (await this.#secrets()?.get?.(reference)) ?? null;
  }

  async set(reference: IsdsSecretReference, value: string): Promise<void> {
    const set = this.#secrets()?.set;
    if (!set) throw new IsdsConfigurationError("Bun.secrets.set is not available in this runtime.");
    await set(reference, value);
  }

  async delete(reference: IsdsSecretReference): Promise<boolean> {
    return (await this.#secrets()?.delete?.(reference)) ?? false;
  }
}

export class PasswordAuthAdapter implements IsdsAuthenticationAdapter {
  readonly type = "password";
  #username: string | undefined;
  #password: string | undefined;

  constructor(
    private readonly options: PasswordAuthentication,
    private readonly secrets: IsdsSecretStore = new BunSecretStore(),
  ) {}

  async initialize(_context: AuthContext = {}): Promise<void> {
    if (this.options.type === "password") {
      this.#username = this.options.username;
      this.#password = this.options.password;
      return;
    }

    const service = this.options.service ?? DEFAULT_SECRET_SERVICE;
    this.#username = await this.secrets.get({ service, name: this.options.usernameSecret }) ?? undefined;
    this.#password = await this.secrets.get({ service, name: this.options.passwordSecret }) ?? undefined;

    if (!this.#username || !this.#password) {
      throw new IsdsAuthenticationError("Password authentication secrets are not available.", {
        service,
        usernameSecret: this.options.usernameSecret,
        passwordSecret: this.options.passwordSecret,
      });
    }
  }

  async decorateRequest(request: RequestContext): Promise<void> {
    if (!this.#username || !this.#password) {
      throw new IsdsAuthenticationError("Password authentication was not initialized.");
    }
    request.headers.set("Authorization", `Basic ${btoa(`${this.#username}:${this.#password}`)}`);
  }

  async handleResponse({ response }: ResponseContext): Promise<void> {
    if (response.status === 401) {
      throw new IsdsAuthenticationError("ISDS authentication failed.", { status: response.status });
    }
  }

  async capabilities(): Promise<IsdsCapabilityPatch> {
    return {
      interfaces: {
        passwordUser: true,
        standardMessages: true,
        dataBoxSearch: true,
        dataBoxAccess: true,
      },
      messages: {
        listReceived: true,
        listSent: true,
        read: true,
        readAll: true,
        send: true,
        sendPDZ: true,
        erase: true,
      },
      dataBoxes: { search: true, inspect: true },
      users: { update: true },
      notifications: { register: true, consume: true },
      crypto: { serverAuthenticate: true, serverRetimestamp: true },
    };
  }

  async close(): Promise<void> {
    this.#username = undefined;
    this.#password = undefined;
  }
}

export function createAuthenticationAdapter(
  authentication: IsdsAuthentication,
  options: { readonly secrets?: IsdsSecretStore } = {},
): IsdsAuthenticationAdapter | undefined {
  if (authentication.type === "none") return undefined;
  if (authentication.type === "password" || authentication.type === "password-secret") {
    return new PasswordAuthAdapter(authentication, options.secrets);
  }
  throw new IsdsConfigurationError("Unsupported authentication type.", { type: (authentication as { type: string }).type });
}
