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

test("high-level sent envelope download calls raw read-only SOAP operation", async () => {
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

  const result = await client.messages.downloadSentEnvelope("654321");
  expect(result.statusCode).toBe("0000");
  expect(result.envelope?.id).toBe("654321");
  expect(result.envelope?.annotation).toBe("Sent Envelope Test");
});

test("high-level mark as downloaded calls raw SOAP operation", async () => {
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

  const result = await client.messages.markAsDownloaded("123456");
  expect(result.statusCode).toBe("0000");
});

test("high-level verify message returns server hash", async () => {
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

  const result = await client.messages.verifyMessage("123456");
  expect(result.statusCode).toBe("0000");
  expect(result.hash).toEqual({ value: "SEFTSA==", algorithm: "SHA-256" });
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

test("high-level erase message calls raw SOAP operation with explicit direction", async () => {
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

  const result = await client.messages.eraseMessage("123456", { incoming: true });
  expect(result.statusCode).toBe("0000");
});

test("high-level erased message list starts async raw SOAP operation", async () => {
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

  const result = await client.messages.getErasedMessagesList({
    year: 2026,
    month: 6,
    messageType: "RECEIVED",
  });
  expect(result.statusCode).toBe("0000");
  expect(result.asyncId).toBe("async-123");
});

test("high-level async pickup returns base64 payload", async () => {
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

  const result = await client.messages.pickUpAsyncResponse("async-123", "GetListOfErasedMessages");
  expect(result.statusCode).toBe("0000");
  expect(result.asyncReqType).toBe("GetListOfErasedMessages");
  expect(result.asyncResponse).toBe("RVJBU0VE");
});

test("high-level notification list calls raw SOAP operation", async () => {
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

  const result = await client.messages.getNotifications({
    fromTime: "2026-06-28T00:00:00Z",
    scope: "delivered",
  });
  expect(result.statusCode).toBe("0000");
  expect(result.listContinues).toBe(false);
  expect(result.records[0]?.messageId).toBe("123456");
  expect(result.records[0]?.annotation).toBe("Notification");
});

test("high-level notification registration calls raw SOAP operation", async () => {
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

  const result = await client.messages.registerForNotifications({ action: 1 });
  expect(result.statusCode).toBe("0000");
});

test("high-level suspicious message report calls raw SOAP operation", async () => {
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

  const result = await client.messages.reportSuspiciousMessage("123456", {
    allowComplete: false,
    reporterEmail: "security@example.test",
    note: "Synthetic report",
  });
  expect(result.statusCode).toBe("0000");
});
