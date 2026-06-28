// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { createAuthenticationAdapter, type IsdsAuthentication } from "../auth/index.ts";
import { mergeCapabilities, NO_CAPABILITIES, type IsdsCapabilities } from "../capabilities/index.ts";
import { resolveEnvironment, type IsdsEnvironment, type ResolvedIsdsEnvironment } from "../config/environment.ts";
import { DataBoxesClient } from "../data-boxes/index.ts";
import { MessagesClient } from "../messages/index.ts";
import { RawSoapClient } from "../raw/index.ts";
import { BunFetchTransport, type IsdsTlsOptions } from "../transport/index.ts";
import { createUnsupportedModule, type UnsupportedModule } from "./modules.ts";

export interface CreateIsdsClientOptions {
  readonly environment: IsdsEnvironment;
  readonly authentication: IsdsAuthentication;
  readonly timeoutMs?: number;
  readonly tls?: IsdsTlsOptions;
  readonly profileName?: string;
}

export interface IsdsClient {
  readonly environment: ResolvedIsdsEnvironment;
  capabilities(): Promise<IsdsCapabilities>;
  close(): Promise<void>;
  readonly raw: RawSoapClient;
  readonly messages: MessagesClient;
  readonly attachments: UnsupportedModule;
  readonly vodz: UnsupportedModule;
  readonly search: DataBoxesClient;
  readonly dataBoxes: DataBoxesClient;
  readonly users: DataBoxesClient;
  readonly administration: UnsupportedModule;
  readonly pdz: DataBoxesClient;
  readonly credit: DataBoxesClient;
  readonly notifications: UnsupportedModule;
  readonly archive: UnsupportedModule;
  readonly gateway: UnsupportedModule;
  readonly authenticationService: UnsupportedModule;
  readonly hss: UnsupportedModule;
  readonly accessInterface: UnsupportedModule;
  readonly mobileKey: UnsupportedModule;
  readonly publicDirectory: UnsupportedModule;
  readonly crypto: UnsupportedModule;
  readonly zfo: UnsupportedModule;
}

export function createIsdsClient(options: CreateIsdsClientOptions): IsdsClient {
  const environment = resolveEnvironment(options.environment);
  const authentication = createAuthenticationAdapter(options.authentication);
  const transport = new BunFetchTransport({
    ...(authentication ? { authentication } : {}),
    ...(options.timeoutMs === undefined ? {} : { timeoutMs: options.timeoutMs }),
    ...(options.tls === undefined ? {} : { tls: options.tls }),
  });
  const raw = new RawSoapClient(transport, (metadata) => {
    const endpoint = environment.endpoints[metadata.endpointCategory];
    if (endpoint) return endpoint;
    if (metadata.endpoint) return new URL(metadata.endpoint);
    return Object.values(environment.endpoints)[0]!;
  });

  let initialized = false;
  async function ensureInitialized(): Promise<void> {
    if (initialized) return;
    await authentication?.initialize(options.profileName ? { profileName: options.profileName } : {});
    initialized = true;
  }

  const dataBoxes = new DataBoxesClient(raw, ensureInitialized);
  return {
    environment,
    raw,
    async capabilities() {
      await ensureInitialized();
      return mergeCapabilities(NO_CAPABILITIES, await authentication?.capabilities() ?? {});
    },
    async close() {
      await authentication?.close();
    },
    messages: new MessagesClient(raw, ensureInitialized),
    attachments: createUnsupportedModule("attachments"),
    vodz: createUnsupportedModule("vodz"),
    search: dataBoxes,
    dataBoxes,
    users: dataBoxes,
    administration: createUnsupportedModule("administration"),
    pdz: dataBoxes,
    credit: dataBoxes,
    notifications: createUnsupportedModule("notifications"),
    archive: createUnsupportedModule("archive"),
    gateway: createUnsupportedModule("gateway"),
    authenticationService: createUnsupportedModule("authenticationService"),
    hss: createUnsupportedModule("hss"),
    accessInterface: createUnsupportedModule("accessInterface"),
    mobileKey: createUnsupportedModule("mobileKey"),
    publicDirectory: createUnsupportedModule("publicDirectory"),
    crypto: createUnsupportedModule("crypto"),
    zfo: createUnsupportedModule("zfo"),
  };
}
