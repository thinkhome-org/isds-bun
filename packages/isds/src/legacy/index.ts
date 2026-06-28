// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { IsdsUnsupportedOperationError } from "../errors/index.ts";

export interface DeprecationMetadata {
  readonly deprecatedSince?: string;
  readonly replacement?: string;
  readonly removedFromProduction?: string;
  readonly lastKnownWsdlVersion?: string;
  readonly supportedEnvironments: readonly ("mock" | "public-test" | "production")[];
  readonly notes?: string;
}

export function createLegacyIsdsClient(): never {
  throw new IsdsUnsupportedOperationError("Legacy ISDS adapters require generated historical schema metadata.");
}
