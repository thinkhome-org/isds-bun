// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import coverage from "../../../../schemas/manifests/operation-coverage.json" with { type: "json" };
import { createIsdsClient } from "../client/index.ts";
import type { IsdsAuthentication } from "../auth/index.ts";
import { IsdsConfigurationError } from "../errors/index.ts";
import { loadIsdsConfig, resolveProfile } from "../config/profiles.ts";
import type { IsdsEnvironment } from "../config/environment.ts";

function flagValue(args: readonly string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function flag(args: readonly string[], name: string): boolean {
  return args.includes(name);
}

function cliEnvironment(args: readonly string[]): IsdsEnvironment | undefined {
  const value = flagValue(args, "--environment");
  if (value === "production" || value === "public-test") return value;
  if (flag(args, "--production")) return "production";
  return undefined;
}

async function resolveCliProfile(args: readonly string[]) {
  const configPath = flagValue(args, "--config");
  const profileName = flagValue(args, "--profile");
  const environment = cliEnvironment(args);
  const config = await loadIsdsConfig({ ...(configPath ? { configPath } : {}) });
  return resolveProfile(config, {
    ...(profileName ? { profileName } : {}),
    ...(environment ? { environment } : {}),
    cwd: process.cwd(),
    env: Bun.env,
  });
}

function requiresAuthentication(authentication: IsdsAuthentication, command: string): boolean {
  if (authentication.type !== "none") return true;
  console.error(`Set ISDS_USERNAME and ISDS_PASSWORD, or configure a password profile, for ${command}.`);
  return false;
}

export async function runCli(args: readonly string[] = Bun.argv.slice(2)): Promise<number> {
  const [command, subcommand] = args;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log("Usage: isds <version|doctor|schema status|profile list|profile show|inbox list|sent list|tui> [--profile name] [--environment production|public-test] [--config path]");
    return 0;
  }

  if (command === "version" || command === "--version" || command === "-v") {
    console.log("0.0.1");
    return 0;
  }

  if (command === "doctor") {
    console.log(JSON.stringify({ runtime: "bun", bunVersion: Bun.version, ok: true }, null, 2));
    return 0;
  }

  if (command === "schema" && subcommand === "status") {
    console.log(JSON.stringify(coverage, null, 2));
    return 0;
  }

  if (command === "profile" && subcommand === "list") {
    const configPath = flagValue(args, "--config");
    const config = await loadIsdsConfig({ ...(configPath ? { configPath } : {}) });
    console.log(JSON.stringify({ profiles: Object.keys(config.profiles), defaultProfile: config.defaultProfile ?? null, sources: config.sources }, null, 2));
    return 0;
  }

  if (command === "profile" && subcommand === "show") {
    const name = flagValue(args, "--profile");
    const configPath = flagValue(args, "--config");
    const config = await loadIsdsConfig({ ...(configPath ? { configPath } : {}) });
    const profileName = name ?? config.defaultProfile;
    if (!profileName || !config.profiles[profileName]) {
      console.error("Profile not found. Use --profile or configure defaultProfile.");
      return 2;
    }
    const profile = config.profiles[profileName];
    console.log(JSON.stringify({
      name: profileName,
      environment: profile.environment ?? null,
      authentication: profile.authentication ?? null,
      usernameSecret: profile.usernameSecret ?? null,
      passwordSecret: profile.passwordSecret ? "[configured]" : null,
      secretService: profile.secretService ?? null,
    }, null, 2));
    return 0;
  }

  if (command === "inbox" && subcommand === "list") {
    const limitIndex = args.indexOf("--limit");
    const limit = limitIndex >= 0 ? Number(args[limitIndex + 1] ?? 10) : 10;
    let profile;
    try {
      profile = await resolveCliProfile(args);
    } catch (error) {
      console.error(error instanceof IsdsConfigurationError ? error.message : String(error));
      return 2;
    }
    if (!requiresAuthentication(profile.authentication, "inbox list")) {
      return 2;
    }
    const client = createIsdsClient({
      environment: profile.environment,
      authentication: profile.authentication,
      timeoutMs: 30000,
      ...(profile.name ? { profileName: profile.name } : {}),
    });
    try {
      const result = await client.messages.listReceived({ limit, offset: 1 });
      const safe = {
        statusCode: result.statusCode,
        statusMessage: result.statusMessage,
        count: result.records.length,
        records: result.records.map((record) => ({
          ordinal: record.ordinal,
          id: record.id,
          messageStatus: record.messageStatus,
          deliveryTime: record.deliveryTime,
          acceptanceTime: record.acceptanceTime,
          senderType: record.senderType,
          vodz: record.vodz,
          suspiciousFlag: record.suspiciousFlag,
        })),
      };
      console.log(JSON.stringify(safe, null, 2));
      return 0;
    } finally {
      await client.close();
    }
  }

  if (command === "sent" && subcommand === "list") {
    const limitIndex = args.indexOf("--limit");
    const limit = limitIndex >= 0 ? Number(args[limitIndex + 1] ?? 10) : 10;
    let profile;
    try {
      profile = await resolveCliProfile(args);
    } catch (error) {
      console.error(error instanceof IsdsConfigurationError ? error.message : String(error));
      return 2;
    }
    if (!requiresAuthentication(profile.authentication, "sent list")) {
      return 2;
    }
    const client = createIsdsClient({
      environment: profile.environment,
      authentication: profile.authentication,
      timeoutMs: 30000,
      ...(profile.name ? { profileName: profile.name } : {}),
    });
    try {
      const result = await client.messages.listSent({ limit, offset: 1 });
      const safe = {
        statusCode: result.statusCode,
        statusMessage: result.statusMessage,
        count: result.records.length,
        records: result.records.map((record) => ({
          ordinal: record.ordinal,
          id: record.id,
          messageStatus: record.messageStatus,
          deliveryTime: record.deliveryTime,
          acceptanceTime: record.acceptanceTime,
          senderType: record.senderType,
          vodz: record.vodz,
          suspiciousFlag: record.suspiciousFlag,
        })),
      };
      console.log(JSON.stringify(safe, null, 2));
      return 0;
    } finally {
      await client.close();
    }
  }

  if (command === "tui") {
    const { runTui } = await import("../tui/index.ts");
    return runTui();
  }

  console.error(`Unknown command: ${args.join(" ")}`);
  return 2;
}
