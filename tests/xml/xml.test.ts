// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "bun:test";
import { assertSafeXml, escapeXmlAttribute, escapeXmlText, firstElementText, IsdsXmlError } from "../../packages/isds/src/index.ts";

test("rejects DTD and entity declarations", () => {
  expect(() => assertSafeXml("<!DOCTYPE x [<!ENTITY e SYSTEM 'file:///etc/passwd'>]><x/>")).toThrow(IsdsXmlError);
});

test("escapes XML safely", () => {
  expect(escapeXmlText("<&>")).toBe("&lt;&amp;&gt;");
  expect(escapeXmlAttribute("\"'")).toBe("&quot;&apos;");
});

test("extracts first element text", () => {
  expect(firstElementText("<a><b>Hello &amp; bye</b></a>", "b")).toBe("Hello & bye");
});
