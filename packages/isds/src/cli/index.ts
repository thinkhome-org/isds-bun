// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import coverage from "../../../../schemas/manifests/operation-coverage.json" with { type: "json" };
import { createIsdsClient } from "../client/index.ts";
import { BunSecretStore, DEFAULT_SECRET_SERVICE, type IsdsAuthentication, type IsdsSecretStore } from "../auth/index.ts";
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

export interface RunCliOptions {
  readonly secrets?: IsdsSecretStore;
  readonly readStdin?: () => Promise<string>;
}

function secretService(args: readonly string[]): string {
  return flagValue(args, "--service") ?? DEFAULT_SECRET_SERVICE;
}

function stripOneTrailingNewline(value: string): string {
  return value.endsWith("\r\n") ? value.slice(0, -2) : value.endsWith("\n") ? value.slice(0, -1) : value;
}

async function readSecretValue(args: readonly string[], options: RunCliOptions): Promise<string | undefined> {
  if (!flag(args, "--value-stdin")) return undefined;
  return stripOneTrailingNewline(await (options.readStdin ?? (() => Bun.stdin.text()))());
}

export async function runCli(args: readonly string[] = Bun.argv.slice(2), options: RunCliOptions = {}): Promise<number> {
  const [command, subcommand] = args;
  const secrets = options.secrets ?? new BunSecretStore();

  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log("Usage: isds <version|doctor|schema status|profile list|profile show|profile secret-status|secret set|secret status|secret delete|inbox list|sent list|tui> [--profile name] [--environment production|public-test] [--config path]");
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

  if (command === "secret" && subcommand === "status") {
    const name = flagValue(args, "--name");
    if (!name) {
      console.error("Secret name is required. Use --name.");
      return 2;
    }
    const service = secretService(args);
    const configured = await secrets.get({ service, name }) !== null;
    console.log(JSON.stringify({ service, name, configured }, null, 2));
    return 0;
  }

  if (command === "secret" && subcommand === "set") {
    const name = flagValue(args, "--name");
    if (!name) {
      console.error("Secret name is required. Use --name.");
      return 2;
    }
    const value = await readSecretValue(args, options);
    if (value === undefined) {
      console.error("Secret value must be provided through --value-stdin.");
      return 2;
    }
    const service = secretService(args);
    await secrets.set({ service, name }, value);
    console.log(JSON.stringify({ service, name, stored: true }, null, 2));
    return 0;
  }

  if (command === "secret" && subcommand === "delete") {
    const name = flagValue(args, "--name");
    if (!name) {
      console.error("Secret name is required. Use --name.");
      return 2;
    }
    const service = secretService(args);
    const deleted = await secrets.delete({ service, name });
    console.log(JSON.stringify({ service, name, deleted }, null, 2));
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

  if (command === "profile" && subcommand === "secret-status") {
    const name = flagValue(args, "--profile");
    const configPath = flagValue(args, "--config");
    const config = await loadIsdsConfig({ ...(configPath ? { configPath } : {}) });
    const profileName = name ?? config.defaultProfile;
    if (!profileName || !config.profiles[profileName]) {
      console.error("Profile not found. Use --profile or configure defaultProfile.");
      return 2;
    }
    const profile = config.profiles[profileName];
    const service = profile.secretService ?? DEFAULT_SECRET_SERVICE;
    const usernameConfigured = profile.usernameSecret
      ? await secrets.get({ service, name: profile.usernameSecret }) !== null
      : null;
    const passwordConfigured = profile.passwordSecret
      ? await secrets.get({ service, name: profile.passwordSecret }) !== null
      : null;
    console.log(JSON.stringify({
      name: profileName,
      service,
      usernameSecret: profile.usernameSecret ? { name: profile.usernameSecret, configured: usernameConfigured } : null,
      passwordSecret: profile.passwordSecret ? { name: profile.passwordSecret, configured: passwordConfigured } : null,
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
