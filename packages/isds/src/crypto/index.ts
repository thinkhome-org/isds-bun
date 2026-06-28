// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

export type VerificationStatus = "not-checked" | "valid" | "invalid" | "warning" | "unsupported";

export interface VerificationFinding {
  readonly code: string;
  readonly message: string;
}

export interface CertificateSummary {
  readonly subject?: string;
  readonly issuer?: string;
  readonly serialNumber?: string;
}

export interface ZfoVerificationReport {
  readonly integrity: VerificationStatus;
  readonly attachmentDigests: VerificationStatus;
  readonly cmsSignature: VerificationStatus;
  readonly certificateChain: VerificationStatus;
  readonly signingTime: VerificationStatus;
  readonly timestamp: VerificationStatus;
  readonly revocation: VerificationStatus;
  readonly archivalEvidence: VerificationStatus;
  readonly isdsServerVerification?: VerificationStatus;
  readonly algorithms: readonly string[];
  readonly certificates: readonly CertificateSummary[];
  readonly warnings: readonly VerificationFinding[];
  readonly errors: readonly VerificationFinding[];
}

export const NOT_CHECKED_ZFO_REPORT: ZfoVerificationReport = {
  integrity: "not-checked",
  attachmentDigests: "not-checked",
  cmsSignature: "not-checked",
  certificateChain: "not-checked",
  signingTime: "not-checked",
  timestamp: "not-checked",
  revocation: "not-checked",
  archivalEvidence: "not-checked",
  algorithms: [],
  certificates: [],
  warnings: [],
  errors: [],
};

export async function sha256Hex(data: Blob | ArrayBuffer | Uint8Array | string): Promise<string> {
  const bytes = typeof data === "string"
    ? new TextEncoder().encode(data)
    : data instanceof Blob
      ? new Uint8Array(await data.arrayBuffer())
      : data instanceof ArrayBuffer
        ? new Uint8Array(data)
        : data;
  const hash = new Bun.CryptoHasher("sha256");
  hash.update(bytes);
  return hash.digest("hex");
}
