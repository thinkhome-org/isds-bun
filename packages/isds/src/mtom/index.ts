// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { IsdsMtomError } from "../errors/index.ts";

export interface MtomPart {
  readonly contentId: string;
  readonly contentType: string;
  readonly body: Blob;
}

export function parseMultipartContentType(contentType: string): { boundary: string; rootType?: string } {
  const boundary = /boundary="?([^";]+)"?/i.exec(contentType)?.[1];
  if (!boundary) throw new IsdsMtomError("Missing multipart boundary.");
  const result: { boundary: string; rootType?: string } = { boundary };
  const rootType = /type="?([^";]+)"?/i.exec(contentType)?.[1];
  if (rootType) result.rootType = rootType;
  return result;
}

export function createMultipartRelated(rootXml: string, parts: readonly MtomPart[]): { body: Blob; contentType: string } {
  const boundary = `isds-${crypto.randomUUID()}`;
  const chunks: BlobPart[] = [
    `--${boundary}\r\nContent-Type: application/xop+xml; charset=utf-8; type="application/soap+xml"\r\nContent-ID: <root>\r\n\r\n`,
    rootXml,
    "\r\n",
  ];

  const ids = new Set<string>(["root"]);
  for (const part of parts) {
    if (ids.has(part.contentId)) throw new IsdsMtomError("Duplicate MTOM Content-ID.", { contentId: part.contentId });
    ids.add(part.contentId);
    chunks.push(
      `--${boundary}\r\nContent-Type: ${part.contentType}\r\nContent-ID: <${part.contentId}>\r\n\r\n`,
      part.body,
      "\r\n",
    );
  }

  chunks.push(`--${boundary}--\r\n`);
  return {
    body: new Blob(chunks),
    contentType: `multipart/related; boundary="${boundary}"; type="application/xop+xml"; start="<root>"`,
  };
}
