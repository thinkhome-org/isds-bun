// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

const manifestPath = "schemas/manifests/operation-coverage.json";
const manifest = await Bun.file(manifestPath).json();

await Bun.write("docs/generated/wsdl-operation-coverage.md", `# WSDL Operation Coverage

Status: blocked on official WSDL/XSD ingestion.

| Metric | Value |
|---|---:|
| WSDL operations discovered | ${manifest.operationsDiscovered} |
| Raw methods generated | ${manifest.rawMethodsGenerated} |
| High-level wrappers complete | ${manifest.highLevelWrappersComplete} |
| Contract fixtures | ${manifest.contractFixtures} |
| Operation coverage | ${manifest.coveragePercent}% |

This report is generated. It remains at 0% until authoritative WSDL/XSD files are ingested.
`);

console.log("Generated coverage report.");

export {};
