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

type BunSecrets = {
  get?: (options: { service: string; name: string }) => Promise<string | null>;
};

async function readBunSecret(service: string, name: string): Promise<string | null> {
  const secrets = (Bun as unknown as { secrets?: BunSecrets }).secrets;
  return (await secrets?.get?.({ service, name })) ?? null;
}

export class PasswordAuthAdapter implements IsdsAuthenticationAdapter {
  readonly type = "password";
  #username: string | undefined;
  #password: string | undefined;

  constructor(private readonly options: PasswordAuthentication) {}

  async initialize(_context: AuthContext = {}): Promise<void> {
    if (this.options.type === "password") {
      this.#username = this.options.username;
      this.#password = this.options.password;
      return;
    }

    const service = this.options.service ?? "thinkhome-isds";
    this.#username = await readBunSecret(service, this.options.usernameSecret) ?? undefined;
    this.#password = await readBunSecret(service, this.options.passwordSecret) ?? undefined;

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

export function createAuthenticationAdapter(authentication: IsdsAuthentication): IsdsAuthenticationAdapter | undefined {
  if (authentication.type === "none") return undefined;
  if (authentication.type === "password" || authentication.type === "password-secret") {
    return new PasswordAuthAdapter(authentication);
  }
  throw new IsdsConfigurationError("Unsupported authentication type.", { type: (authentication as { type: string }).type });
}
