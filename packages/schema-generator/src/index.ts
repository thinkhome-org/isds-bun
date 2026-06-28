// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { sha256Hex } from "../../isds/src/crypto/index.ts";

export interface SchemaArtifact {
  readonly path: string;
  readonly bytes: Uint8Array;
}

export async function summarizeArtifacts(artifacts: readonly SchemaArtifact[]) {
  return Promise.all(artifacts.map(async (artifact) => ({
    path: artifact.path,
    sha256: await sha256Hex(artifact.bytes),
  })));
}
