// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

const manifest = await Bun.file("schemas/manifests/operation-coverage.json").json();
if (typeof manifest.coveragePercent !== "number") {
  throw new Error("Invalid operation coverage manifest.");
}
if (manifest.coveragePercent !== 0 && manifest.coveragePercent !== 100) {
  throw new Error(`Partial operation coverage is not releasable: ${manifest.coveragePercent}%`);
}
console.log(`Operation coverage gate: ${manifest.coveragePercent}%`);

export {};
