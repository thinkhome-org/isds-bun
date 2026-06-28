// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { IsdsStatusError } from "../errors/index.ts";
import type { RawSoapClient } from "../raw/index.ts";
import { escapeXmlText } from "../xml/index.ts";

export interface ListReceivedMessagesOptions {
  readonly fromTime?: Date;
  readonly toTime?: Date;
  readonly recipientOrgUnitNumber?: number | null;
  readonly statusFilter?: string;
  readonly offset?: number | null;
  readonly limit?: number | null;
  readonly signal?: AbortSignal;
}

export interface ListSentMessagesOptions {
  readonly fromTime?: Date;
  readonly toTime?: Date;
  readonly senderOrgUnitNumber?: number | null;
  readonly statusFilter?: string;
  readonly offset?: number | null;
  readonly limit?: number | null;
  readonly signal?: AbortSignal;
}

export interface ReceivedMessageRecord {
  readonly ordinal?: number;
  readonly id?: string;
  readonly senderBoxId?: string;
  readonly sender?: string;
  readonly senderType?: number;
  readonly recipient?: string;
  readonly annotation?: string;
  readonly messageStatus?: number;
  readonly attachmentSizeKb?: number;
  readonly deliveryTime?: string;
  readonly acceptanceTime?: string;
  readonly type?: string;
  readonly vodz?: boolean;
  readonly suspiciousFlag?: number;
}

export type SentMessageRecord = ReceivedMessageRecord;

export interface ListReceivedMessagesResult {
  readonly statusCode: string;
  readonly statusMessage: string;
  readonly records: readonly ReceivedMessageRecord[];
  readonly rawXml: string;
}

export interface ListSentMessagesResult {
  readonly statusCode: string;
  readonly statusMessage: string;
  readonly records: readonly SentMessageRecord[];
  readonly rawXml: string;
}

function nilElement(name: string): string {
  return `<${name} xsi:nil="true"/>`;
}

function valueElement(name: string, value: string | number | Date | null | undefined): string {
  if (value === null || value === undefined) return nilElement(name);
  const text = value instanceof Date ? value.toISOString() : String(value);
  return `<${name}>${escapeXmlText(text)}</${name}>`;
}

function firstText(xml: string, name: string): string | undefined {
  const match = new RegExp(`<(?:[\\w.-]+:)?${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?${name}>`).exec(xml);
  return match?.[1]
    ?.replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

function numberFrom(xml: string, name: string): number | undefined {
  const text = firstText(xml, name);
  if (!text) return undefined;
  const value = Number(text);
  return Number.isFinite(value) ? value : undefined;
}

function attr(xml: string, name: string): string | undefined {
  return new RegExp(`${name}="([^"]*)"`).exec(xml)?.[1];
}

function boolAttr(xml: string, name: string): boolean | undefined {
  const value = attr(xml, name);
  if (value === undefined) return undefined;
  return value === "true" || value === "1";
}

function parseRecords(xml: string): ReceivedMessageRecord[] {
  const records: ReceivedMessageRecord[] = [];
  for (const match of xml.matchAll(/<((?:[\w.-]+:)?dmRecord)([^>]*)>([\s\S]*?)<\/\1>/g)) {
    const attrs = match[2] ?? "";
    const body = match[3] ?? "";
    const record: Record<string, unknown> = {};
    const fields = {
      ordinal: numberFrom(body, "dmOrdinal"),
      id: firstText(body, "dmID"),
      senderBoxId: firstText(body, "dbIDSender"),
      sender: firstText(body, "dmSender"),
      senderType: numberFrom(body, "dmSenderType"),
      recipient: firstText(body, "dmRecipient"),
      annotation: firstText(body, "dmAnnotation"),
      messageStatus: numberFrom(body, "dmMessageStatus"),
      attachmentSizeKb: numberFrom(body, "dmAttachmentSize"),
      deliveryTime: firstText(body, "dmDeliveryTime"),
      acceptanceTime: firstText(body, "dmAcceptanceTime"),
      type: attr(attrs, "dmType"),
      vodz: boolAttr(attrs, "dmVODZ"),
      suspiciousFlag: attr(attrs, "specMessFlag") ? Number(attr(attrs, "specMessFlag")) : undefined,
    };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) record[key] = value;
    }
    records.push(record as ReceivedMessageRecord);
  }
  return records;
}

export class MessagesClient {
  constructor(
    private readonly raw: RawSoapClient,
    private readonly ensureInitialized: () => Promise<void>,
  ) {}

  async listReceived(options: ListReceivedMessagesOptions = {}): Promise<ListReceivedMessagesResult> {
    await this.ensureInitialized();
    const bodyXml = `<GetListOfReceivedMessages xmlns="http://isds.czechpoint.cz/v20" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
      valueElement("dmFromTime", options.fromTime) +
      valueElement("dmToTime", options.toTime) +
      valueElement("dmRecipientOrgUnitNum", options.recipientOrgUnitNumber) +
      `<dmStatusFilter>${escapeXmlText(options.statusFilter ?? "")}</dmStatusFilter>` +
      valueElement("dmOffset", options.offset ?? 1) +
      valueElement("dmLimit", options.limit ?? 10) +
      `</GetListOfReceivedMessages>`;

    const rawXml = await this.raw.invokeGeneratedXml(
      "GetListOfReceivedMessages",
      bodyXml,
      options.signal ? { signal: options.signal } : {},
    );

    const statusCode = firstText(rawXml, "dmStatusCode") ?? "";
    const statusMessage = firstText(rawXml, "dmStatusMessage") ?? "";
    if (statusCode !== "0000") {
      throw new IsdsStatusError("ISDS returned an application status error.", { statusCode, statusMessage });
    }

    return {
      statusCode,
      statusMessage,
      records: parseRecords(rawXml),
      rawXml,
    };
  }

  async listSent(options: ListSentMessagesOptions = {}): Promise<ListSentMessagesResult> {
    await this.ensureInitialized();
    const bodyXml = `<GetListOfSentMessages xmlns="http://isds.czechpoint.cz/v20" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
      valueElement("dmFromTime", options.fromTime) +
      valueElement("dmToTime", options.toTime) +
      valueElement("dmSenderOrgUnitNum", options.senderOrgUnitNumber) +
      `<dmStatusFilter>${escapeXmlText(options.statusFilter ?? "")}</dmStatusFilter>` +
      valueElement("dmOffset", options.offset ?? 1) +
      valueElement("dmLimit", options.limit ?? 10) +
      `</GetListOfSentMessages>`;

    const rawXml = await this.raw.invokeGeneratedXml(
      "GetListOfSentMessages",
      bodyXml,
      options.signal ? { signal: options.signal } : {},
    );

    const statusCode = firstText(rawXml, "dmStatusCode") ?? "";
    const statusMessage = firstText(rawXml, "dmStatusMessage") ?? "";
    if (statusCode !== "0000") {
      throw new IsdsStatusError("ISDS returned an application status error.", { statusCode, statusMessage });
    }

    return {
      statusCode,
      statusMessage,
      records: parseRecords(rawXml),
      rawXml,
    };
  }
}
