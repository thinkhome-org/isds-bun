// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

if (Bun.argv.includes("--check")) {
  const coverage = await Bun.file("schemas/manifests/operation-coverage.json").json();
  if (coverage.coveragePercent !== 100) {
    throw new Error("Release blocked until WSDL operation coverage is 100%.");
  }
}

export {};
