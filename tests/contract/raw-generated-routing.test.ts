// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { afterEach, expect, test } from "bun:test";
import { PasswordAuthAdapter } from "../../packages/isds/src/auth/index.ts";
import { IsdsUnsupportedOperationError } from "../../packages/isds/src/errors/index.ts";
import { RawSoapClient } from "../../packages/isds/src/raw/index.ts";
import { BunFetchTransport } from "../../packages/isds/src/transport/index.ts";

const servers: ReturnType<typeof Bun.serve>[] = [];

afterEach(() => {
  for (const server of servers.splice(0)) server.stop(true);
});

function endpointServer(name: string) {
  const server = Bun.serve({
    port: 0,
    async fetch() {
      return new Response(
        `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><Result>${name}</Result></soap:Body></soap:Envelope>`,
        { headers: { "Content-Type": "text/xml" } },
      );
    },
  });
  servers.push(server);
  return server;
}

test("generated raw operations route by endpoint category", async () => {
  const messages = endpointServer("messages");
  const search = endpointServer("search");
  const info = endpointServer("info");
  const auth = new PasswordAuthAdapter({ type: "password", username: "u", password: "p" });
  await auth.initialize({});
  const raw = new RawSoapClient(new BunFetchTransport({ authentication: auth }), (metadata) => {
    if (metadata.endpointCategory === "search") return new URL(search.url);
    if (metadata.endpointCategory === "info") return new URL(info.url);
    return new URL(messages.url);
  });

  await expect(raw.invokeGeneratedXml("GetListOfReceivedMessages", "<x/>")).resolves.toContain("<Result>messages</Result>");
  await expect(raw.invokeGeneratedXml("FindDataBox2", "<x/>")).resolves.toContain("<Result>search</Result>");
  await expect(raw.invokeGeneratedXml("GetOwnerInfoFromLogin2", "<x/>")).resolves.toContain("<Result>info</Result>");
});

test("unknown generated raw operation fails before network", async () => {
  const auth = new PasswordAuthAdapter({ type: "password", username: "u", password: "p" });
  await auth.initialize({});
  const raw = new RawSoapClient(new BunFetchTransport({ authentication: auth }), new URL("https://example.invalid"));
  await expect(raw.invokeGeneratedXml("NotARealOperation", "<x/>")).rejects.toThrow(IsdsUnsupportedOperationError);
});
