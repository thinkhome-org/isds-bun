// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { IsdsXmlError } from "../errors/index.ts";

export interface XmlLimits {
  readonly maxBytes?: number;
  readonly maxDepth?: number;
}

const DANGEROUS_XML = /<!DOCTYPE|<!ENTITY|SYSTEM\s+["']|PUBLIC\s+["']/i;

export function assertSafeXml(xml: string, limits: XmlLimits = {}): void {
  const maxBytes = limits.maxBytes ?? 10 * 1024 * 1024;
  if (new TextEncoder().encode(xml).byteLength > maxBytes) {
    throw new IsdsXmlError("XML exceeds configured size limit.", { maxBytes });
  }
  if (DANGEROUS_XML.test(xml)) {
    throw new IsdsXmlError("DTD and external entities are not allowed.");
  }

  const maxDepth = limits.maxDepth ?? 128;
  let depth = 0;
  for (const match of xml.matchAll(/<\/?([A-Za-z_][\w:.-]*)(?:\s[^>]*)?>/g)) {
    const tag = match[0];
    if (tag.startsWith("</")) depth -= 1;
    else if (!tag.endsWith("/>")) depth += 1;
    if (depth > maxDepth) throw new IsdsXmlError("XML exceeds configured depth limit.", { maxDepth });
    if (depth < 0) throw new IsdsXmlError("XML has invalid element nesting.");
  }
}

export function escapeXmlText(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function escapeXmlAttribute(value: unknown): string {
  return escapeXmlText(value).replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}

export function firstElementText(xml: string, localName: string): string | undefined {
  assertSafeXml(xml);
  const pattern = new RegExp(`<([\\w.-]+:)?${localName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/([\\w.-]+:)?${localName}>`);
  const match = pattern.exec(xml);
  return match?.[2]
    ?.replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}
