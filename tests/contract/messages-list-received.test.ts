// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { afterEach, expect, test } from "bun:test";
import { createIsdsClient } from "../../packages/isds/src/index.ts";
import { startMockIsdsServer } from "../../packages/mock-server/src/index.ts";

let server: ReturnType<typeof startMockIsdsServer> | undefined;

afterEach(() => {
  server?.stop(true);
  server = undefined;
});

test("high-level received list calls raw read-only SOAP operation", async () => {
  server = startMockIsdsServer({ username: "u", password: "p" });
  const client = createIsdsClient({
    environment: {
      type: "custom",
      name: "mock",
      allowInsecureHttp: true,
      endpoints: { messages: server.url.toString() },
    },
    authentication: { type: "password", username: "u", password: "p" },
  });

  const result = await client.messages.listReceived({ limit: 1 });
  expect(result.statusCode).toBe("0000");
  expect(result.records).toHaveLength(1);
  expect(result.records[0]?.id).toBe("123456");
});

test("high-level sent list calls raw read-only SOAP operation", async () => {
  server = startMockIsdsServer({ username: "u", password: "p" });
  const client = createIsdsClient({
    environment: {
      type: "custom",
      name: "mock",
      allowInsecureHttp: true,
      endpoints: { messages: server.url.toString() },
    },
    authentication: { type: "password", username: "u", password: "p" },
  });

  const result = await client.messages.listSent({ limit: 1 });
  expect(result.statusCode).toBe("0000");
  expect(result.records).toHaveLength(1);
  expect(result.records[0]?.id).toBe("654321");
});
