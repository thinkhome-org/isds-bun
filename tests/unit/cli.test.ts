// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "bun:test";
import type { IsdsSecretReference, IsdsSecretStore } from "../../packages/isds/src/index.ts";
import { runCli } from "../../packages/isds/src/cli/index.ts";

class MemorySecretStore implements IsdsSecretStore {
  readonly values = new Map<string, string>();

  key(reference: IsdsSecretReference): string {
    return `${reference.service}\0${reference.name}`;
  }

  async get(reference: IsdsSecretReference): Promise<string | null> {
    return this.values.get(this.key(reference)) ?? null;
  }

  async set(reference: IsdsSecretReference, value: string): Promise<void> {
    this.values.set(this.key(reference), value);
  }

  async delete(reference: IsdsSecretReference): Promise<boolean> {
    return this.values.delete(this.key(reference));
  }
}

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

test("secret commands store and report secret status without printing values", async () => {
  const secrets = new MemorySecretStore();

  const missing = await captureStdout(() => runCli(["secret", "status", "--name", "profile/username"], { secrets }));
  expect(missing.code).toBe(0);
  expect(JSON.parse(missing.output)).toMatchObject({
    service: "thinkhome-isds",
    name: "profile/username",
    configured: false,
  });

  const set = await captureStdout(() => runCli(["secret", "set", "--name", "profile/username", "--value-stdin"], {
    secrets,
    readStdin: async () => "super-secret\n",
  }));
  expect(set.code).toBe(0);
  expect(set.output).not.toContain("super-secret");
  expect(await secrets.get({ service: "thinkhome-isds", name: "profile/username" })).toBe("super-secret");

  const present = await captureStdout(() => runCli(["secret", "status", "--name", "profile/username"], { secrets }));
  expect(JSON.parse(present.output).configured).toBe(true);

  const deleted = await captureStdout(() => runCli(["secret", "delete", "--name", "profile/username"], { secrets }));
  expect(deleted.code).toBe(0);
  expect(JSON.parse(deleted.output).deleted).toBe(true);
});

test("profile secret-status checks configured references without exposing values", async () => {
  const secrets = new MemorySecretStore();
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
  await secrets.set({ service: "thinkhome-isds", name: "company-production/username" }, "user-secret");

  const status = await captureStdout(() => runCli(["profile", "secret-status", "--config", configPath], { secrets }));
  expect(status.code).toBe(0);
  expect(status.output).not.toContain("user-secret");
  expect(JSON.parse(status.output)).toMatchObject({
    name: "company-production",
    service: "thinkhome-isds",
    usernameSecret: { name: "company-production/username", configured: true },
    passwordSecret: { name: "company-production/password", configured: false },
  });
});
