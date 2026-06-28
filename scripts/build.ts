// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

const result = await Bun.build({
  entrypoints: ["packages/isds/src/index.ts", "packages/isds/src/bin/isds.ts"],
  outdir: "dist",
  target: "bun",
  format: "esm",
  external: ["@opentui/core"],
  sourcemap: "external",
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

console.log("Built SDK entrypoints.");

export {};
