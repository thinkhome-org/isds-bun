// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

const manifest = await Bun.file("schemas/manifests/operation-coverage.json").json();
if (typeof manifest.coveragePercent !== "number") {
  throw new Error("Invalid operation coverage manifest.");
}
if (manifest.operationsDiscovered > 0 && manifest.rawCoveragePercent !== 100) {
  throw new Error(`Generated raw coverage must be 100%, got ${manifest.rawCoveragePercent}%`);
}
console.log(`Operation coverage gate: raw ${manifest.rawCoveragePercent ?? manifest.coveragePercent}%, high-level ${manifest.highLevelCoveragePercent ?? 0}%`);

export {};
