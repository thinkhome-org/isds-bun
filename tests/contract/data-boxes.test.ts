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

function createClient() {
  server = startMockIsdsServer({ username: "u", password: "p" });
  return createIsdsClient({
    environment: {
      type: "custom",
      name: "mock",
      allowInsecureHttp: true,
      endpoints: { info: server.url.toString(), search: server.url.toString() },
    },
    authentication: { type: "password", username: "u", password: "p" },
  });
}

test("high-level data-box access and search wrappers call raw SOAP operations", async () => {
  const client = createClient();

  expect((await client.dataBoxes.getOwnerInfo()).owner?.boxId).toBe("abc123");
  expect((await client.dataBoxes.getOwnerInfoLegacy()).owner?.firmName).toBe("ThinkHome s.r.o.");
  expect((await client.users.getUserInfo()).user?.isdsId).toBe("isds-user-1");
  expect((await client.users.getUserInfoLegacy()).user?.userId).toBe("usr001");
  expect((await client.users.getPasswordInfo()).expiresAt).toBe("2027-01-01T00:00:00+01:00");
  expect((await client.users.changePassword("old", "new")).statusCode).toBe("0000");

  expect((await client.dataBoxes.findDataBoxes({ ic: "12345678" })).records[0]?.boxId).toBe("abc123");
  expect((await client.dataBoxes.findDataBoxesLegacy({ ic: "12345678" })).records[0]?.type).toBe("PO");
  expect((await client.dataBoxes.checkDataBox("abc123")).state).toBe(1);
  expect((await client.dataBoxes.getDataBoxList("CSV")).data).toBe("REJMSVNURA==");
  expect((await client.pdz.pdzInfo("abc123")).records[0]?.count).toBe(5);
  expect((await client.credit.creditInfo("abc123")).currentCredit).toBe(100);

  const currentSearch = await client.search.search({ text: "ThinkHome", type: "GENERAL" });
  expect(currentSearch.totalCount).toBe(1);
  expect(currentSearch.records[0]?.ovmId).toBe("ovm-1");
  expect((await client.search.searchLegacy({ text: "ThinkHome" })).records[0]?.sendOptions).toBe("ALL");
  expect((await client.dataBoxes.getActivityStatus("abc123", "2026-01-01T00:00:00+01:00", "2026-12-31T23:59:59+01:00")).periods[0]?.state).toBe(1);
  expect((await client.dataBoxes.findPersonalDataBox({ lastName: "Owner" })).records[0]?.lastName).toBe("Owner");
  expect((await client.dataBoxes.dtInfo("abc123")).activeCapacity).toBe(1000);
  expect((await client.pdz.pdzSendInfo("abc123", "VoDZ")).allowed).toBe(true);
  expect((await client.search.getConstants("2026-01-01")).records[0]?.name).toBe("MAX_ATTACHMENT_SIZE");
  expect((await client.dataBoxes.getAddress("abc123")).fullAddress1).toBe("Testovaci 1, Praha");

  await client.close();
});
