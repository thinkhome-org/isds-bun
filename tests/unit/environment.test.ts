// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { describe, expect, test } from "bun:test";
import { IsdsConfigurationError, resolveEnvironment } from "../../packages/isds/src/index.ts";

describe("environment", () => {
  test("requires explicit HTTPS for custom endpoints", () => {
    expect(() => resolveEnvironment({
      type: "custom",
      name: "bad",
      endpoints: { messages: "http://localhost:9999" },
    })).toThrow(IsdsConfigurationError);
  });

  test("uses June 2026 preferred domains", () => {
    expect(resolveEnvironment("production").endpoints.messages?.hostname).toBe("ws1.datovka.gov.cz");
    expect(resolveEnvironment("public-test").endpoints.messages?.hostname).toBe("ws1.datovka-test.gov.cz");
    expect(resolveEnvironment("production").endpoints.messages?.pathname).toBe("/DS/dx");
  });
});
