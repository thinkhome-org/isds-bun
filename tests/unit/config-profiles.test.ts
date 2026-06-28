// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "bun:test";
import { loadIsdsConfig, resolveProfile } from "../../packages/isds/src/index.ts";

test("loads TOML profiles and resolves project default", async () => {
  const dir = await Bun.$`mktemp -d`.text().then((value) => value.trim());
  const configPath = `${dir}/config.toml`;
  await Bun.write(configPath, `
defaultProfile = "company-production"

[profiles.company-production]
environment = "production"
authentication = "password"
usernameSecret = "company-production/username"
passwordSecret = "company-production/password"

[profiles.company-test]
environment = "public-test"
authentication = "none"

[groups.companies]
profiles = ["company-production", "company-test"]

[projects."${dir}"]
defaultProfile = "company-test"
`);

  const config = await loadIsdsConfig({ configPath, cwd: dir });
  expect(config.sources).toEqual([configPath]);
  expect(Object.keys(config.profiles)).toEqual(["company-production", "company-test"]);
  expect(config.groups.companies?.profiles).toEqual(["company-production", "company-test"]);

  const projectProfile = resolveProfile(config, { cwd: dir, env: {} });
  expect(projectProfile.name).toBe("company-test");
  expect(projectProfile.environment).toBe("public-test");
  expect(projectProfile.authentication).toEqual({ type: "none" });

  const envOverride = resolveProfile(config, {
    profileName: "company-production",
    environment: "public-test",
    env: { ISDS_USERNAME: "u", ISDS_PASSWORD: "p" },
  });
  expect(envOverride.environment).toBe("public-test");
  expect(envOverride.authentication).toEqual({ type: "password", username: "u", password: "p" });
});
