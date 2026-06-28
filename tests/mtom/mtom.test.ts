// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "bun:test";
import { createMultipartRelated, IsdsMtomError, parseMultipartContentType, parseMultipartRelated } from "../../packages/isds/src/index.ts";

test("parses multipart boundary", () => {
  expect(parseMultipartContentType('multipart/related; boundary="abc"; type="application/xop+xml"')).toEqual({
    boundary: "abc",
    rootType: "application/xop+xml",
  });
});

test("rejects duplicate content ids", () => {
  expect(() => createMultipartRelated("<x/>", [
    { contentId: "a", contentType: "text/plain", body: new Blob(["a"]) },
    { contentId: "a", contentType: "text/plain", body: new Blob(["b"]) },
  ])).toThrow(IsdsMtomError);
});

test("parses multipart related response and validates xop references", async () => {
  const body = [
    "--abc",
    'Content-Type: application/xop+xml; charset=utf-8; type="application/soap+xml"',
    "Content-ID: <root>",
    "",
    '<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"><soap:Body><file><xop:Include xmlns:xop="http://www.w3.org/2004/08/xop/include" href="cid:file-1"/></file></soap:Body></soap:Envelope>',
    "--abc",
    "Content-Type: application/octet-stream",
    "Content-ID: <file-1>",
    "",
    "hello",
    "--abc--",
    "",
  ].join("\r\n");

  const parsed = parseMultipartRelated(body, 'multipart/related; boundary="abc"; type="application/xop+xml"; start="<root>"');
  expect(parsed.rootContentId).toBe("root");
  expect(parsed.rootXml).toContain("xop:Include");
  expect(parsed.xopReferences).toEqual(["file-1"]);
  expect(parsed.parts).toHaveLength(1);
  expect(parsed.parts[0]?.contentId).toBe("file-1");
  expect(new TextDecoder().decode(parsed.parts[0]!.body)).toBe("hello");
});

test("rejects multipart response with missing xop part", () => {
  const body = [
    "--abc",
    "Content-Type: application/xop+xml",
    "Content-ID: <root>",
    "",
    '<xop:Include xmlns:xop="http://www.w3.org/2004/08/xop/include" href="cid:missing"/>',
    "--abc--",
    "",
  ].join("\r\n");

  expect(() => parseMultipartRelated(body, 'multipart/related; boundary="abc"; start="<root>"')).toThrow(IsdsMtomError);
});

test("rejects duplicate content ids while parsing", () => {
  const body = [
    "--abc",
    "Content-Type: application/xop+xml",
    "Content-ID: <root>",
    "",
    "<x/>",
    "--abc",
    "Content-Type: application/octet-stream",
    "Content-ID: <root>",
    "",
    "duplicate",
    "--abc--",
    "",
  ].join("\r\n");

  expect(() => parseMultipartRelated(body, 'multipart/related; boundary="abc"')).toThrow(IsdsMtomError);
});

test("enforces multipart part and header limits", () => {
  const twoParts = [
    "--abc",
    "Content-Type: application/xop+xml",
    "Content-ID: <root>",
    "",
    "<x/>",
    "--abc",
    "Content-Type: application/octet-stream",
    "Content-ID: <file>",
    "",
    "body",
    "--abc--",
    "",
  ].join("\r\n");
  expect(() => parseMultipartRelated(twoParts, 'multipart/related; boundary="abc"', { maxParts: 1 })).toThrow(IsdsMtomError);

  const largeHeader = [
    "--abc",
    `X-Long: ${"a".repeat(32)}`,
    "Content-ID: <root>",
    "",
    "<x/>",
    "--abc--",
    "",
  ].join("\r\n");
  expect(() => parseMultipartRelated(largeHeader, 'multipart/related; boundary="abc"', { maxHeaderBytes: 16 })).toThrow(IsdsMtomError);
});
