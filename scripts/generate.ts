// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { sha256Hex } from "../packages/isds/src/crypto/index.ts";

interface Operation {
  operation: string;
  service: string;
  port?: string;
  binding?: string;
  endpointCategory: string;
  endpoint?: string;
  soapAction?: string;
  soapVersion: "1.1";
  idempotent: boolean;
  requestMessage?: string;
  responseMessage?: string;
  sourceWsdl: string;
  sourceWsdlSha256: string;
  highLevelWrapper: boolean;
  fixture: boolean;
  test: boolean;
}

const WSDL_DIR = "schemas/production";
const wsdlFiles = Array.from(new Bun.Glob("*.wsdl").scanSync(WSDL_DIR)).sort();
const operations: Operation[] = [];
const bundle = await Bun.file("schemas/manifests/production-bundle.json").exists()
  ? await Bun.file("schemas/manifests/production-bundle.json").json()
  : undefined;
const wrappers = await Bun.file("schemas/manifests/high-level-wrappers.json").exists()
  ? await Bun.file("schemas/manifests/high-level-wrappers.json").json()
  : { operations: {} };

function attr(text: string, name: string): string | undefined {
  return new RegExp(`${name}="([^"]*)"`).exec(text)?.[1];
}

function endpointCategory(endpoint: string): string {
  if (endpoint.endsWith("/DS/dx")) return "messages";
  if (endpoint.endsWith("/DS/dz")) return "messages";
  if (endpoint.endsWith("/DS/df")) return "search";
  if (endpoint.endsWith("/DS/DsManage")) return "info";
  return "unknown";
}

function idempotent(operation: string): boolean {
  return !/^(Create|Update|Delete|Erase|Mark|Register|Change|Re-sign|Upload|PickUp|Susp)/.test(operation);
}

for (const file of wsdlFiles) {
  const path = `${WSDL_DIR}/${file}`;
  const xml = await Bun.file(path).text();
  const digest = await sha256Hex(await Bun.file(path).arrayBuffer());
  const service = attr(/<service\b[^>]*>/.exec(xml)?.[0] ?? "", "name") ?? file.replace(/\.wsdl$/, "");
  const endpoint = attr(/<soap:address\b[^>]*>/.exec(xml)?.[0] ?? "", "location");
  const port = attr(/<port\b[^>]*>/.exec(xml)?.[0] ?? "", "name");
  const binding = attr(/<binding\b[^>]*>/.exec(xml)?.[0] ?? "", "name");
  const bindingActions = new Map<string, string>();

  for (const match of xml.matchAll(/<operation\b[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/operation>/g)) {
    const name = match[1]!;
    const body = match[2] ?? "";
    const action = attr(/<soap:operation\b[^>]*>/.exec(body)?.[0] ?? "", "soapAction");
    if (action !== undefined) bindingActions.set(name, action);
  }

  const portType = /<portType\b[^>]*>([\s\S]*?)<\/portType>/.exec(xml)?.[1] ?? "";
  for (const match of portType.matchAll(/<operation\b[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/operation>/g)) {
    const operation = match[1]!;
    const body = match[2] ?? "";
    const requestMessage = attr(/<input\b[^>]*>/.exec(body)?.[0] ?? "", "message")?.replace(/^tns:/, "");
    const responseMessage = attr(/<output\b[^>]*>/.exec(body)?.[0] ?? "", "message")?.replace(/^tns:/, "");
    const wrapper = wrappers.operations[operation];
    operations.push({
      operation,
      service,
      ...(port ? { port } : {}),
      ...(binding ? { binding } : {}),
      endpointCategory: endpoint ? endpointCategory(endpoint) : "unknown",
      ...(endpoint ? { endpoint } : {}),
      soapAction: bindingActions.get(operation) ?? "",
      soapVersion: "1.1",
      idempotent: idempotent(operation),
      ...(requestMessage ? { requestMessage } : {}),
      ...(responseMessage ? { responseMessage } : {}),
      sourceWsdl: file,
      sourceWsdlSha256: digest,
      highLevelWrapper: Boolean(wrapper),
      fixture: Boolean(wrapper?.fixture),
      test: Boolean(wrapper?.test),
    });
  }
}

const rawMethodsGenerated = operations.length;
const highLevelWrappersComplete = operations.filter((operation) => operation.highLevelWrapper).length;
const contractFixtures = operations.filter((operation) => operation.fixture).length;
const rawCoveragePercent = operations.length === 0 ? 0 : Math.round((rawMethodsGenerated / operations.length) * 100);
const highLevelCoveragePercent = operations.length === 0 ? 0 : Math.round((highLevelWrappersComplete / operations.length) * 100);
const manifest = {
  generatedAt: bundle?.retrievedAt ?? null,
  source: "official-datovka-v20",
  operationsDiscovered: operations.length,
  rawMethodsGenerated,
  highLevelWrappersComplete,
  contractFixtures,
  coveragePercent: rawCoveragePercent,
  rawCoveragePercent,
  highLevelCoveragePercent,
  operations,
};

await Bun.write("schemas/manifests/operation-coverage.json", JSON.stringify(manifest, null, 2) + "\n");

const generated = `// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import type { RawOperationMetadata } from "./index.ts";

export const GENERATED_OPERATIONS = ${JSON.stringify(operations.map(({ highLevelWrapper: _h, fixture: _f, test: _t, ...operation }) => operation), null, 2)} as const satisfies readonly RawOperationMetadata[];
`;

await Bun.write("packages/isds/src/raw/operations.generated.ts", generated);

await Bun.write("docs/generated/wsdl-operation-coverage.md", `# WSDL Operation Coverage

Status: generated from official production WSDL/XSD artifacts.

| Metric | Value |
|---|---:|
| WSDL operations discovered | ${manifest.operationsDiscovered} |
| Raw methods generated | ${manifest.rawMethodsGenerated} |
| High-level wrappers complete | ${manifest.highLevelWrappersComplete} |
| Contract fixtures | ${manifest.contractFixtures} |
| Raw operation coverage | ${manifest.rawCoveragePercent}% |
| High-level coverage | ${manifest.highLevelCoveragePercent}% |

| Service | Operation | Endpoint | Raw | High-level | Fixture | Test |
|---|---|---|---:|---:|---:|---:|
${operations.map((operation) => `| ${operation.service} | \`${operation.operation}\` | ${operation.endpointCategory} | yes | ${operation.highLevelWrapper ? "yes" : "no"} | ${operation.fixture ? "yes" : "no"} | ${operation.test ? "yes" : "no"} |`).join("\n")}
`);

console.log(`Generated ${operations.length} WSDL operations.`);

export {};
