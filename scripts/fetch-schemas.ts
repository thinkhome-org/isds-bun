// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { sha256Hex } from "../packages/isds/src/crypto/index.ts";

const DEFAULT_SCHEMA_URLS = [
  "https://www.datovka.gov.cz/static/wsdl/v20/dm_info.wsdl",
  "https://www.datovka.gov.cz/static/wsdl/v20/dm_operations.wsdl",
  "https://www.datovka.gov.cz/static/wsdl/v20/db_search.wsdl",
  "https://www.datovka.gov.cz/static/wsdl/v20/db_access.wsdl",
  "https://www.datovka.gov.cz/static/wsdl/v20/dmBaseTypes.xsd",
  "https://www.datovka.gov.cz/static/wsdl/v20/dbTypes.xsd",
] as const;

const configuredUrls = (Bun.env.ISDS_SCHEMA_URLS ?? DEFAULT_SCHEMA_URLS.join(","))
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

await Bun.write("schemas/manifests/source-urls.txt", `${configuredUrls.join("\n")}\n`);

const files = [];
for (const rawUrl of configuredUrls) {
  const url = new URL(rawUrl);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const digest = await sha256Hex(bytes);
  const name = url.pathname.split("/").filter(Boolean).at(-1) ?? `${digest}.xml`;
  await Bun.write(`schemas/production/${name}`, bytes);
  files.push({
    path: `schemas/production/${name}`,
    sha256: digest,
    contentType: response.headers.get("content-type") ?? undefined,
    etag: response.headers.get("etag") ?? undefined,
    lastModified: response.headers.get("last-modified") ?? undefined,
  });
  console.log(`${name} ${digest}`);
}

await Bun.write("schemas/manifests/production-bundle.json", JSON.stringify({
  environment: "production",
  declaredVersion: "3.11",
  retrievedAt: new Date().toISOString(),
  sourceUrls: configuredUrls,
  files,
  manuals: [],
}, null, 2) + "\n");

export {};
