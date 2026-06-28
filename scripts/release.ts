// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

if (Bun.argv.includes("--check")) {
  const coverage = await Bun.file("schemas/manifests/operation-coverage.json").json();
  if (coverage.rawCoveragePercent !== 100 || coverage.highLevelCoveragePercent !== 100) {
    throw new Error("Release blocked until raw and high-level WSDL operation coverage are 100%.");
  }
}

export {};
