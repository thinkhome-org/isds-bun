// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { IsdsConfigurationError } from "../errors/index.ts";

export type KnownEnvironmentName = "production" | "public-test";

export type IsdsEndpointCategory =
  | "messages"
  | "search"
  | "info"
  | "administration"
  | "vodz"
  | "notifications"
  | "publicDirectory"
  | "authenticationService"
  | "gateway"
  | "hss"
  | "accessInterface"
  | "mobileKey";

export type IsdsEndpointMap = Partial<Record<IsdsEndpointCategory, string>>;

export type IsdsEnvironment =
  | KnownEnvironmentName
  | {
      type: "custom";
      name: string;
      endpoints: IsdsEndpointMap;
      expectedSchema?: {
        version?: string;
        digest?: string;
      };
      allowInsecureHttp?: boolean;
    };

export interface ResolvedIsdsEnvironment {
  readonly name: string;
  readonly kind: KnownEnvironmentName | "custom";
  readonly endpoints: Readonly<Record<string, URL>>;
  readonly expectedSchema?: {
    version?: string;
    digest?: string;
  };
}

const BUILT_IN_ORIGINS: Record<KnownEnvironmentName, string> = {
  production: "https://ws1.datovka.gov.cz/",
  "public-test": "https://ws1.datovka-test.gov.cz/",
};

export function resolveEnvironment(environment: IsdsEnvironment): ResolvedIsdsEnvironment {
  if (environment === "production" || environment === "public-test") {
    const origin = BUILT_IN_ORIGINS[environment];
    return {
      name: environment,
      kind: environment,
      endpoints: {
        messages: new URL("/DS/dx", origin),
        search: new URL("/DS/df", origin),
        info: new URL("/DS/dx", origin),
        administration: new URL(origin),
        vodz: new URL("/DS/dz", origin),
        notifications: new URL("/DS/dx", origin),
        publicDirectory: new URL(origin),
        authenticationService: new URL(origin),
        gateway: new URL(origin),
        hss: new URL(origin),
        accessInterface: new URL(origin),
        mobileKey: new URL(origin),
      },
    };
  }

  if (!environment || environment.type !== "custom") {
    throw new IsdsConfigurationError("An explicit ISDS environment is required.");
  }

  const endpoints: Record<string, URL> = {};
  for (const [category, rawUrl] of Object.entries(environment.endpoints)) {
    if (!rawUrl) continue;
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && !environment.allowInsecureHttp) {
      throw new IsdsConfigurationError("Custom ISDS endpoints must use HTTPS unless explicitly allowed.", {
        category,
        url: url.toString(),
      });
    }
    endpoints[category] = url;
  }

  if (Object.keys(endpoints).length === 0) {
    throw new IsdsConfigurationError("Custom ISDS environment requires at least one endpoint.");
  }

  return {
    name: environment.name,
    kind: "custom",
    endpoints,
    ...(environment.expectedSchema ? { expectedSchema: environment.expectedSchema } : {}),
  };
}
