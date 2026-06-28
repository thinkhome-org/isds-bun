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

test("high-level envelope download calls raw read-only SOAP operation", async () => {
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

  const result = await client.messages.downloadEnvelope("123456");
  expect(result.statusCode).toBe("0000");
  expect(result.envelope?.id).toBe("123456");
  expect(result.envelope?.annotation).toBe("Envelope Test");
});

test("high-level delivery info calls raw read-only SOAP operation", async () => {
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

  const result = await client.messages.getDeliveryInfo("123456");
  expect(result.statusCode).toBe("0000");
  expect(result.delivery?.envelope?.id).toBe("123456");
  expect(result.delivery?.events[0]?.description).toBe("Delivered");
});

test("high-level signed delivery info calls raw read-only SOAP operation", async () => {
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

  const result = await client.messages.getSignedDeliveryInfo("123456");
  expect(result.statusCode).toBe("0000");
  expect(result.signature).toBe("U0lHTkFUVVJF");
});

test("high-level state changes calls raw read-only SOAP operation", async () => {
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

  const result = await client.messages.getStateChanges();
  expect(result.statusCode).toBe("0000");
  expect(result.records).toEqual([{ id: "123456", eventTime: "2026-06-28T00:00:00Z", messageStatus: 4 }]);
});

test("high-level message author calls raw read-only SOAP operation", async () => {
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

  const result = await client.messages.getAuthor("123456");
  expect(result.statusCode).toBe("0000");
  expect(result.authorName).toBe("Author One");
});

test("high-level message author2 calls raw read-only SOAP operation", async () => {
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

  const result = await client.messages.getAuthor2("123456");
  expect(result.statusCode).toBe("0000");
  expect(result.authorName).toBe("Author Two");
});
