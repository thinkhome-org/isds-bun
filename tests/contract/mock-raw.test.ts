// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { afterEach, expect, test } from "bun:test";
import { PasswordAuthAdapter } from "../../packages/isds/src/auth/index.ts";
import { RawSoapClient } from "../../packages/isds/src/raw/index.ts";
import { BunFetchTransport } from "../../packages/isds/src/transport/index.ts";
import { startMockIsdsServer } from "../../packages/mock-server/src/index.ts";

let server: ReturnType<typeof startMockIsdsServer> | undefined;

afterEach(() => {
  server?.stop(true);
  server = undefined;
});

test("raw SOAP client calls mock server with password auth", async () => {
  server = startMockIsdsServer({ username: "u", password: "p" });
  const auth = new PasswordAuthAdapter({ type: "password", username: "u", password: "p" });
  await auth.initialize({});
  const client = new RawSoapClient(new BunFetchTransport({ authentication: auth }), new URL(server.url));
  const response = await client.invokeXml({
    operation: "MockOperation",
    service: "MockService",
    endpointCategory: "messages",
    soapVersion: "1.1",
    idempotent: true,
  }, "<mock:Ping xmlns:mock=\"urn:thinkhome:isds:mock\"/>");
  expect(response).toContain("<mock:Ok");
});
