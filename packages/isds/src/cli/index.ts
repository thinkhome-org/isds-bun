// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import coverage from "../../../../schemas/manifests/operation-coverage.json" with { type: "json" };
import { createIsdsClient } from "../client/index.ts";

export async function runCli(args: readonly string[] = Bun.argv.slice(2)): Promise<number> {
  const [command, subcommand] = args;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    console.log("Usage: isds <version|doctor|schema status|inbox list|tui>");
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

  if (command === "inbox" && subcommand === "list") {
    const environment = args.includes("--production") ? "production" : "public-test";
    const limitIndex = args.indexOf("--limit");
    const limit = limitIndex >= 0 ? Number(args[limitIndex + 1] ?? 10) : 10;
    const username = Bun.env.ISDS_USERNAME;
    const password = Bun.env.ISDS_PASSWORD;
    if (!username || !password) {
      console.error("Set ISDS_USERNAME and ISDS_PASSWORD for inbox list.");
      return 2;
    }
    const client = createIsdsClient({
      environment,
      authentication: { type: "password", username, password },
      timeoutMs: 30000,
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

  if (command === "tui") {
    const { runTui } = await import("../tui/index.ts");
    return runTui();
  }

  console.error(`Unknown command: ${args.join(" ")}`);
  return 2;
}
