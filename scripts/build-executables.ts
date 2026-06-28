// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

const target = Bun.env.BUN_BUILD_TARGET ?? "bun-darwin-arm64";
const proc = Bun.spawn({
  cmd: ["bun", "build", "--compile", `--target=${target}`, "packages/isds/src/bin/isds.ts", "--outfile", `dist/isds-${target}`],
  stdout: "inherit",
  stderr: "inherit",
});

process.exitCode = await proc.exited;

export {};
