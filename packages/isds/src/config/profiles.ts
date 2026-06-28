// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import type { IsdsAuthentication } from "../auth/index.ts";
import { IsdsConfigurationError } from "../errors/index.ts";
import type { IsdsEnvironment } from "./environment.ts";

export interface IsdsProfile {
  readonly environment?: IsdsEnvironment;
  readonly authentication?: "password" | "none";
  readonly usernameSecret?: string;
  readonly passwordSecret?: string;
  readonly secretService?: string;
}

export interface IsdsConfig {
  readonly defaultProfile?: string;
  readonly profiles: Readonly<Record<string, IsdsProfile>>;
  readonly groups: Readonly<Record<string, { readonly profiles: readonly string[] }>>;
  readonly projects: Readonly<Record<string, { readonly defaultProfile?: string }>>;
  readonly sources: readonly string[];
}

export interface LoadIsdsConfigOptions {
  readonly configPath?: string;
  readonly cwd?: string;
  readonly env?: Record<string, string | undefined>;
}

export interface ResolveProfileOptions {
  readonly profileName?: string;
  readonly environment?: IsdsEnvironment;
  readonly cwd?: string;
  readonly env?: Record<string, string | undefined>;
}

export interface ResolvedProfile {
  readonly name?: string;
  readonly environment: IsdsEnvironment;
  readonly authentication: IsdsAuthentication;
}

type TomlObject = Record<string, unknown>;

function asObject(value: unknown): TomlObject {
  return value && typeof value === "object" && !Array.isArray(value) ? value as TomlObject : {};
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeEnvironment(value: unknown): IsdsEnvironment | undefined {
  if (value === "production" || value === "public-test") return value;
  if (value && typeof value === "object") return value as IsdsEnvironment;
  return undefined;
}

function normalizeProfile(value: unknown): IsdsProfile {
  const input = asObject(value);
  const environment = normalizeEnvironment(input.environment);
  const usernameSecret = asString(input.usernameSecret);
  const passwordSecret = asString(input.passwordSecret);
  const secretService = asString(input.secretService);
  return {
    ...(environment ? { environment } : {}),
    ...(input.authentication === "password" || input.authentication === "none" ? { authentication: input.authentication } : {}),
    ...(usernameSecret ? { usernameSecret } : {}),
    ...(passwordSecret ? { passwordSecret } : {}),
    ...(secretService ? { secretService } : {}),
  };
}

function mergeConfigs(base: IsdsConfig, next: IsdsConfig): IsdsConfig {
  const defaultProfile = next.defaultProfile ?? base.defaultProfile;
  return {
    ...(defaultProfile ? { defaultProfile } : {}),
    profiles: { ...base.profiles, ...next.profiles },
    groups: { ...base.groups, ...next.groups },
    projects: { ...base.projects, ...next.projects },
    sources: [...base.sources, ...next.sources],
  };
}

function parseConfig(text: string, source: string): IsdsConfig {
  const parsed = asObject(Bun.TOML.parse(text));
  const defaultProfile = asString(parsed.defaultProfile);
  const profiles: Record<string, IsdsProfile> = {};
  for (const [name, value] of Object.entries(asObject(parsed.profiles))) profiles[name] = normalizeProfile(value);

  const groups: Record<string, { profiles: string[] }> = {};
  for (const [name, value] of Object.entries(asObject(parsed.groups))) {
    groups[name] = { profiles: asStringArray(asObject(value).profiles) };
  }

  const projects: Record<string, { defaultProfile?: string }> = {};
  for (const [path, value] of Object.entries(asObject(parsed.projects))) {
    const defaultProfile = asString(asObject(value).defaultProfile);
    projects[path] = defaultProfile ? { defaultProfile } : {};
  }

  return {
    ...(defaultProfile ? { defaultProfile } : {}),
    profiles,
    groups,
    projects,
    sources: [source],
  };
}

export function standardUserConfigPath(env: Record<string, string | undefined> = Bun.env): string | undefined {
  const home = env.HOME ?? env.USERPROFILE;
  if (process.platform === "win32") return env.APPDATA ? `${env.APPDATA}\\isds\\config.toml` : undefined;
  if (process.platform === "darwin") return home ? `${home}/Library/Application Support/isds/config.toml` : undefined;
  if (env.XDG_CONFIG_HOME) return `${env.XDG_CONFIG_HOME}/isds/config.toml`;
  return home ? `${home}/.config/isds/config.toml` : undefined;
}

export async function loadIsdsConfig(options: LoadIsdsConfigOptions = {}): Promise<IsdsConfig> {
  const cwd = options.cwd ?? process.cwd();
  const userPath = standardUserConfigPath(options.env);
  const paths = options.configPath ? [options.configPath] : [userPath, `${cwd}/isds.toml`].filter((path): path is string => Boolean(path));
  let config: IsdsConfig = { profiles: {}, groups: {}, projects: {}, sources: [] };
  for (const path of paths) {
    const file = Bun.file(path);
    if (!(await file.exists())) continue;
    config = mergeConfigs(config, parseConfig(await file.text(), path));
  }
  return config;
}

export function resolveProfile(config: IsdsConfig, options: ResolveProfileOptions = {}): ResolvedProfile {
  const env = options.env ?? Bun.env;
  const projectProfile = options.cwd ? config.projects[options.cwd]?.defaultProfile : undefined;
  const profileName = options.profileName ?? env.ISDS_PROFILE ?? projectProfile ?? config.defaultProfile;
  const profile = profileName ? config.profiles[profileName] : undefined;
  if (profileName && !profile) throw new IsdsConfigurationError("Configured ISDS profile does not exist.", { profileName });

  const environment = options.environment ?? normalizeEnvironment(env.ISDS_ENVIRONMENT) ?? profile?.environment;
  if (!environment) throw new IsdsConfigurationError("ISDS environment is required. Use --environment, ISDS_ENVIRONMENT, or a profile.");

  const username = env.ISDS_USERNAME;
  const password = env.ISDS_PASSWORD;
  const authentication: IsdsAuthentication = username && password
    ? { type: "password", username, password }
    : profile?.authentication === "none"
      ? { type: "none" }
      : profile?.usernameSecret && profile.passwordSecret
        ? { type: "password-secret", usernameSecret: profile.usernameSecret, passwordSecret: profile.passwordSecret, ...(profile.secretService ? { service: profile.secretService } : {}) }
        : { type: "none" };

  return {
    ...(profileName ? { name: profileName } : {}),
    environment,
    authentication,
  };
}
