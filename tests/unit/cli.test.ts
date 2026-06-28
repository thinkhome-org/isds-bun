// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "bun:test";
import { runCli } from "../../packages/isds/src/cli/index.ts";

async function captureStdout(run: () => Promise<number>): Promise<{ code: number; output: string }> {
  const original = console.log;
  const lines: string[] = [];
  console.log = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
  };
  try {
    const code = await run();
    return { code, output: lines.join("\n") };
  } finally {
    console.log = original;
  }
}

test("profile list and show use explicit TOML config", async () => {
  const dir = await Bun.$`mktemp -d`.text().then((value) => value.trim());
  const configPath = `${dir}/config.toml`;
  await Bun.write(configPath, `
defaultProfile = "company-production"

[profiles.company-production]
environment = "production"
authentication = "password"
usernameSecret = "company-production/username"
passwordSecret = "company-production/password"
`);

  const list = await captureStdout(() => runCli(["profile", "list", "--config", configPath]));
  expect(list.code).toBe(0);
  expect(JSON.parse(list.output).profiles).toEqual(["company-production"]);

  const show = await captureStdout(() => runCli(["profile", "show", "--config", configPath]));
  expect(show.code).toBe(0);
  expect(JSON.parse(show.output)).toMatchObject({
    name: "company-production",
    environment: "production",
    authentication: "password",
    passwordSecret: "[configured]",
  });
});
