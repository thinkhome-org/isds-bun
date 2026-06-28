// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "bun:test";
import { createIsdsClient } from "../../packages/isds/src/index.ts";

test("password profile reports implemented standard SDK capabilities", async () => {
  const client = createIsdsClient({
    environment: "public-test",
    authentication: { type: "password", username: "u", password: "p" },
  });

  const capabilities = await client.capabilities();
  expect(capabilities.interfaces).toEqual({
    passwordUser: true,
    standardMessages: true,
    dataBoxSearch: true,
    dataBoxAccess: true,
  });
  expect(capabilities.messages).toMatchObject({
    listReceived: true,
    listSent: true,
    read: true,
    readAll: true,
    send: true,
    sendPDZ: true,
    sendVoDZ: false,
    erase: true,
  });
  expect(capabilities.dataBoxes).toEqual({ search: true, inspect: true, administer: false });
  expect(capabilities.users).toEqual({ list: false, add: false, update: true, remove: false });
  expect(capabilities.notifications).toEqual({ register: true, consume: true });
  expect(capabilities.crypto).toEqual({ serverAuthenticate: true, serverRetimestamp: true, localVerify: false });

  await client.close();
});

test("no authentication reports no effective capabilities", async () => {
  const client = createIsdsClient({
    environment: "public-test",
    authentication: { type: "none" },
  });

  const capabilities = await client.capabilities();
  expect(capabilities.messages.send).toBe(false);
  expect(capabilities.dataBoxes.search).toBe(false);
  expect(capabilities.interfaces).toEqual({});
});
