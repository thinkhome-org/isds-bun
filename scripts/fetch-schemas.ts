// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { sha256Hex } from "../packages/isds/src/crypto/index.ts";

const configuredUrls = (Bun.env.ISDS_SCHEMA_URLS ?? "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

if (configuredUrls.length === 0) {
  console.log("No ISDS_SCHEMA_URLS configured. Skipping schema download.");
  console.log("Set comma-separated official WSDL/XSD URLs before claiming operation coverage.");
  process.exit(0);
}

await Bun.write("schemas/manifests/source-urls.txt", `${configuredUrls.join("\n")}\n`);

for (const rawUrl of configuredUrls) {
  const url = new URL(rawUrl);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  const digest = await sha256Hex(bytes);
  const name = url.pathname.split("/").filter(Boolean).at(-1) ?? `${digest}.xml`;
  await Bun.write(`schemas/production/${name}`, bytes);
  console.log(`${name} ${digest}`);
}

export {};
