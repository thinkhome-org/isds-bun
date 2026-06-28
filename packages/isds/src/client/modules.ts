// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { IsdsUnsupportedOperationError } from "../errors/index.ts";

export type UnsupportedModule = Record<string, never> & {
  readonly supported: false;
  unsupported(operation: string): never;
};

export function createUnsupportedModule(module: string): UnsupportedModule {
  return {
    supported: false,
    unsupported(operation: string): never {
      throw new IsdsUnsupportedOperationError("ISDS operation is not generated yet.", { module, operation });
    },
  } as UnsupportedModule;
}
