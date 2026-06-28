// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { IsdsMtomError } from "../errors/index.ts";

export interface MtomPart {
  readonly contentId: string;
  readonly contentType: string;
  readonly body: Blob;
}

export interface ParsedMtomPart {
  readonly contentId: string;
  readonly contentType: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: Uint8Array;
}

export interface ParsedMtomMessage {
  readonly boundary: string;
  readonly rootContentId: string;
  readonly rootXml: string;
  readonly parts: readonly ParsedMtomPart[];
  readonly xopReferences: readonly string[];
}

export interface ParseMtomOptions {
  readonly maxBytes?: number;
  readonly maxParts?: number;
  readonly maxHeaderBytes?: number;
}

const DEFAULT_MAX_BYTES = 16 * 1024 * 1024;
const DEFAULT_MAX_PARTS = 256;
const DEFAULT_MAX_HEADER_BYTES = 16 * 1024;

function ascii(bytes: Uint8Array): string {
  return new TextDecoder("latin1").decode(bytes);
}

function utf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

function bytes(input: string | ArrayBuffer | Uint8Array): Uint8Array {
  if (typeof input === "string") return new TextEncoder().encode(input);
  if (input instanceof Uint8Array) return input;
  return new Uint8Array(input);
}

function parameter(contentType: string, name: string): string | undefined {
  const match = new RegExp(`${name}="?([^";]+)"?`, "i").exec(contentType);
  return match?.[1];
}

function normalizeContentId(value: string): string {
  const trimmed = value.trim().replace(/^<|>$/g, "");
  return trimmed.startsWith("cid:") ? decodeURIComponent(trimmed.slice(4)) : trimmed;
}

function parseHeaders(text: string, maxHeaderBytes: number): Record<string, string> {
  if (new TextEncoder().encode(text).byteLength > maxHeaderBytes) {
    throw new IsdsMtomError("MTOM part headers exceed configured limit.", { maxHeaderBytes });
  }
  const headers: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    if (!line) continue;
    const index = line.indexOf(":");
    if (index <= 0) throw new IsdsMtomError("Malformed MTOM part header.", { header: line });
    headers[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim();
  }
  return headers;
}

function findNextBoundary(text: string, boundary: string, bodyStart: number): { index: number; prefixLength: number } {
  const crlf = text.indexOf(`\r\n--${boundary}`, bodyStart);
  const lf = text.indexOf(`\n--${boundary}`, bodyStart);
  if (crlf < 0 && lf < 0) throw new IsdsMtomError("MTOM part is missing a closing boundary.");
  if (crlf >= 0 && (lf < 0 || crlf <= lf)) return { index: crlf, prefixLength: 2 };
  return { index: lf, prefixLength: 1 };
}

function collectXopReferences(rootXml: string): string[] {
  const references = new Set<string>();
  const includePattern = /<[\w.-]+:Include\b[^>]*\bhref=(["'])cid:([^"']+)\1[^>]*>/gi;
  for (const match of rootXml.matchAll(includePattern)) {
    references.add(decodeURIComponent(match[2]!));
  }
  return [...references];
}

export function parseMultipartContentType(contentType: string): { boundary: string; rootType?: string; start?: string } {
  const boundary = /boundary="?([^";]+)"?/i.exec(contentType)?.[1];
  if (!boundary) throw new IsdsMtomError("Missing multipart boundary.");
  const result: { boundary: string; rootType?: string } = { boundary };
  const rootType = parameter(contentType, "type");
  if (rootType) result.rootType = rootType;
  const start = parameter(contentType, "start");
  if (start) return { ...result, start: normalizeContentId(start) };
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

export function parseMultipartRelated(
  input: string | ArrayBuffer | Uint8Array,
  contentType: string,
  options: ParseMtomOptions = {},
): ParsedMtomMessage {
  const data = bytes(input);
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const maxParts = options.maxParts ?? DEFAULT_MAX_PARTS;
  const maxHeaderBytes = options.maxHeaderBytes ?? DEFAULT_MAX_HEADER_BYTES;
  if (data.byteLength > maxBytes) throw new IsdsMtomError("MTOM message exceeds configured size limit.", { maxBytes });

  const { boundary, start } = parseMultipartContentType(contentType);
  const text = ascii(data);
  const marker = `--${boundary}`;
  let position = text.indexOf(marker);
  if (position < 0) throw new IsdsMtomError("MTOM multipart boundary was not found.", { boundary });

  const ids = new Set<string>();
  const parts: ParsedMtomPart[] = [];

  while (text.startsWith(marker, position)) {
    position += marker.length;
    if (text.startsWith("--", position)) break;
    if (text.startsWith("\r\n", position)) position += 2;
    else if (text.startsWith("\n", position)) position += 1;
    else throw new IsdsMtomError("Malformed MTOM boundary line.");

    const headerEnd = text.indexOf("\r\n\r\n", position);
    if (headerEnd < 0) throw new IsdsMtomError("MTOM part headers are not terminated.");
    const headers = parseHeaders(text.slice(position, headerEnd), maxHeaderBytes);
    const bodyStart = headerEnd + 4;
    const next = findNextBoundary(text, boundary, bodyStart);
    const contentIdHeader = headers["content-id"];
    if (!contentIdHeader) throw new IsdsMtomError("MTOM part is missing Content-ID.");
    const contentId = normalizeContentId(contentIdHeader);
    if (ids.has(contentId)) throw new IsdsMtomError("Duplicate MTOM Content-ID.", { contentId });
    ids.add(contentId);
    if (parts.length + 1 > maxParts) throw new IsdsMtomError("MTOM part count exceeds configured limit.", { maxParts });
    parts.push({
      contentId,
      contentType: headers["content-type"] ?? "application/octet-stream",
      headers,
      body: data.slice(bodyStart, next.index),
    });
    position = next.index + next.prefixLength;
  }

  if (parts.length === 0) throw new IsdsMtomError("MTOM message does not contain a root part.");
  const rootContentId = start ?? parts[0]!.contentId;
  const root = parts.find((part) => part.contentId === rootContentId);
  if (!root) throw new IsdsMtomError("MTOM root part is missing.", { rootContentId });
  const rootXml = utf8(root.body);
  const binaryParts = parts.filter((part) => part.contentId !== rootContentId);
  const binaryIds = new Set(binaryParts.map((part) => part.contentId));
  const xopReferences = collectXopReferences(rootXml);
  for (const contentId of xopReferences) {
    if (!binaryIds.has(contentId)) throw new IsdsMtomError("MTOM xop:Include references a missing MIME part.", { contentId });
  }

  return {
    boundary,
    rootContentId,
    rootXml,
    parts: binaryParts,
    xopReferences,
  };
}
