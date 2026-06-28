// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "bun:test";
import { IsdsConfigurationError } from "../../packages/isds/src/index.ts";

test("errors redact secrets", () => {
  const error = new IsdsConfigurationError("bad", {
    username: "visible",
    password: "hidden",
    nested: { token: "hidden" },
  });
  expect(error.toJSON()).toEqual({
    name: "IsdsConfigurationError",
    code: "ISDS_CONFIGURATION",
    message: "bad",
    details: {
      username: "visible",
      password: "[REDACTED]",
      nested: { token: "[REDACTED]" },
    },
  });
});
