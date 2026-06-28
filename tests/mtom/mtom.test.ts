// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "bun:test";
import { createMultipartRelated, IsdsMtomError, parseMultipartContentType } from "../../packages/isds/src/index.ts";

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
