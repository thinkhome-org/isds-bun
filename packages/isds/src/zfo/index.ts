// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { NOT_CHECKED_ZFO_REPORT, type ZfoVerificationReport } from "../crypto/index.ts";

export interface ZfoBytes {
  readonly bytes: Uint8Array;
}

export function inspectZfo(bytes: Uint8Array): ZfoBytes {
  return { bytes };
}

export function createUnverifiedZfoReport(): ZfoVerificationReport {
  return {
    ...NOT_CHECKED_ZFO_REPORT,
    warnings: [{ code: "ZFO_NOT_IMPLEMENTED", message: "Local ZFO verification requires Phase 7 crypto adapters." }],
  };
}
