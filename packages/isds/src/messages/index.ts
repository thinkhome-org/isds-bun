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

export interface MessageEnvelopeDownloadResult {
  readonly statusCode: string;
  readonly statusMessage: string;
  readonly envelope?: ReceivedMessageRecord;
  readonly rawXml: string;
}

export interface DeliveryEvent {
  readonly time?: string;
  readonly description?: string;
}

export interface DeliveryInfoResult {
  readonly statusCode: string;
  readonly statusMessage: string;
  readonly delivery?: {
    readonly envelope?: ReceivedMessageRecord;
    readonly hash?: string;
    readonly timestamp?: string;
    readonly deliveryTime?: string;
    readonly acceptanceTime?: string;
    readonly messageStatus?: number;
    readonly events: readonly DeliveryEvent[];
  };
  readonly rawXml: string;
}

export interface SignedDeliveryInfoResult {
  readonly statusCode: string;
  readonly statusMessage: string;
  readonly signature?: string;
  readonly rawXml: string;
}

export interface MessageStateChange {
  readonly id: string;
  readonly eventTime: string;
  readonly messageStatus: number;
}

export interface GetMessageStateChangesOptions {
  readonly fromTime?: Date;
  readonly toTime?: Date;
  readonly signal?: AbortSignal;
}

export interface GetMessageStateChangesResult {
  readonly statusCode: string;
  readonly statusMessage: string;
  readonly records: readonly MessageStateChange[];
  readonly rawXml: string;
}

export interface MessageAuthorResult {
  readonly statusCode: string;
  readonly statusMessage: string;
  readonly userType?: string;
  readonly authorName?: string;
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

function elementBody(xml: string, name: string): string | undefined {
  return new RegExp(`<((?:[\\w.-]+:)?${name})(?:\\s[^>]*)?>([\\s\\S]*?)<\\/\\1>`).exec(xml)?.[2];
}

function idRequest(operation: string, messageId: string): string {
  return `<${operation} xmlns="http://isds.czechpoint.cz/v20"><dmID>${escapeXmlText(messageId)}</dmID></${operation}>`;
}

function parseEnvelope(xml: string, attrs = ""): ReceivedMessageRecord {
  const record: Record<string, unknown> = {};
  const fields = {
    id: firstText(xml, "dmID"),
    senderBoxId: firstText(xml, "dbIDSender"),
    sender: firstText(xml, "dmSender"),
    senderType: numberFrom(xml, "dmSenderType"),
    recipient: firstText(xml, "dmRecipient"),
    annotation: firstText(xml, "dmAnnotation"),
    messageStatus: numberFrom(xml, "dmMessageStatus"),
    attachmentSizeKb: numberFrom(xml, "dmAttachmentSize"),
    deliveryTime: firstText(xml, "dmDeliveryTime"),
    acceptanceTime: firstText(xml, "dmAcceptanceTime"),
    type: attr(attrs, "dmType"),
    vodz: boolAttr(attrs, "dmVODZ"),
    suspiciousFlag: attr(attrs, "specMessFlag") ? Number(attr(attrs, "specMessFlag")) : undefined,
  };
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) record[key] = value;
  }
  return record as ReceivedMessageRecord;
}

function parseRecords(xml: string): ReceivedMessageRecord[] {
  const records: ReceivedMessageRecord[] = [];
  for (const match of xml.matchAll(/<((?:[\w.-]+:)?dmRecord)([^>]*)>([\s\S]*?)<\/\1>/g)) {
    const attrs = match[2] ?? "";
    const body = match[3] ?? "";
    const record = parseEnvelope(body, attrs) as Record<string, unknown>;
    const ordinal = numberFrom(body, "dmOrdinal");
    if (ordinal !== undefined) record.ordinal = ordinal;
    records.push(record as ReceivedMessageRecord);
  }
  return records;
}

function parseEvents(xml: string): DeliveryEvent[] {
  const events: DeliveryEvent[] = [];
  for (const match of xml.matchAll(/<((?:[\w.-]+:)?dmEvent)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)) {
    const body = match[2] ?? "";
    const event: Record<string, string> = {};
    const time = firstText(body, "dmEventTime");
    const description = firstText(body, "dmEventDescr");
    if (time) event.time = time;
    if (description) event.description = description;
    events.push(event as DeliveryEvent);
  }
  return events;
}

function parseStateChanges(xml: string): MessageStateChange[] {
  const records: MessageStateChange[] = [];
  for (const match of xml.matchAll(/<((?:[\w.-]+:)?dmRecord)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)) {
    const body = match[2] ?? "";
    const id = firstText(body, "dmID");
    const eventTime = firstText(body, "dmEventTime");
    const messageStatus = numberFrom(body, "dmMessageStatus");
    if (id && eventTime && messageStatus !== undefined) {
      records.push({ id, eventTime, messageStatus });
    }
  }
  return records;
}

function statusFrom(rawXml: string): { statusCode: string; statusMessage: string } {
  return {
    statusCode: firstText(rawXml, "dmStatusCode") ?? "",
    statusMessage: firstText(rawXml, "dmStatusMessage") ?? "",
  };
}

function assertOk(rawXml: string): { statusCode: string; statusMessage: string } {
  const status = statusFrom(rawXml);
  if (status.statusCode !== "0000") {
    throw new IsdsStatusError("ISDS returned an application status error.", status);
  }
  return status;
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

    const { statusCode, statusMessage } = assertOk(rawXml);

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

    const { statusCode, statusMessage } = assertOk(rawXml);

    return {
      statusCode,
      statusMessage,
      records: parseRecords(rawXml),
      rawXml,
    };
  }

  async downloadEnvelope(messageId: string, options: { signal?: AbortSignal } = {}): Promise<MessageEnvelopeDownloadResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml(
      "MessageEnvelopeDownload",
      idRequest("MessageEnvelopeDownload", messageId),
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertOk(rawXml);
    const returned = elementBody(rawXml, "dmReturnedMessageEnvelope");
    const envelopeBody = returned ? elementBody(returned, "dmDm") : undefined;
    const attrs = /<((?:[\w.-]+:)?dmReturnedMessageEnvelope)([^>]*)>/.exec(rawXml)?.[2] ?? "";
    return {
      statusCode,
      statusMessage,
      ...(envelopeBody ? { envelope: parseEnvelope(envelopeBody, attrs) } : {}),
      rawXml,
    };
  }

  async getDeliveryInfo(messageId: string, options: { signal?: AbortSignal } = {}): Promise<DeliveryInfoResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml(
      "GetDeliveryInfo",
      idRequest("GetDeliveryInfo", messageId),
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertOk(rawXml);
    const delivery = elementBody(rawXml, "dmDelivery");
    const dmDm = delivery ? elementBody(delivery, "dmDm") : undefined;
    const parsedDelivery: Record<string, unknown> = { events: delivery ? parseEvents(delivery) : [] };
    if (delivery) {
      if (dmDm) parsedDelivery.envelope = parseEnvelope(dmDm);
      const hash = firstText(delivery, "dmHash");
      const timestamp = firstText(delivery, "dmQTimestamp");
      const deliveryTime = firstText(delivery, "dmDeliveryTime");
      const acceptanceTime = firstText(delivery, "dmAcceptanceTime");
      const messageStatus = numberFrom(delivery, "dmMessageStatus");
      if (hash) parsedDelivery.hash = hash;
      if (timestamp) parsedDelivery.timestamp = timestamp;
      if (deliveryTime) parsedDelivery.deliveryTime = deliveryTime;
      if (acceptanceTime) parsedDelivery.acceptanceTime = acceptanceTime;
      if (messageStatus !== undefined) parsedDelivery.messageStatus = messageStatus;
    }
    if (!delivery) {
      return { statusCode, statusMessage, rawXml };
    }
    return {
      statusCode,
      statusMessage,
      delivery: parsedDelivery as NonNullable<DeliveryInfoResult["delivery"]>,
      rawXml,
    };
  }

  async getSignedDeliveryInfo(messageId: string, options: { signal?: AbortSignal } = {}): Promise<SignedDeliveryInfoResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml(
      "GetSignedDeliveryInfo",
      idRequest("GetSignedDeliveryInfo", messageId),
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertOk(rawXml);
    const signature = firstText(rawXml, "dmSignature");
    return {
      statusCode,
      statusMessage,
      ...(signature ? { signature } : {}),
      rawXml,
    };
  }

  async getStateChanges(options: GetMessageStateChangesOptions = {}): Promise<GetMessageStateChangesResult> {
    await this.ensureInitialized();
    const bodyXml = `<GetMessageStateChanges xmlns="http://isds.czechpoint.cz/v20" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
      valueElement("dmFromTime", options.fromTime) +
      valueElement("dmToTime", options.toTime) +
      `</GetMessageStateChanges>`;

    const rawXml = await this.raw.invokeGeneratedXml(
      "GetMessageStateChanges",
      bodyXml,
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertOk(rawXml);
    return {
      statusCode,
      statusMessage,
      records: parseStateChanges(rawXml),
      rawXml,
    };
  }

  async getAuthor(messageId: string, options: { signal?: AbortSignal } = {}): Promise<MessageAuthorResult> {
    return this.getAuthorByOperation("GetMessageAuthor", messageId, options);
  }

  async getAuthor2(messageId: string, options: { signal?: AbortSignal } = {}): Promise<MessageAuthorResult> {
    return this.getAuthorByOperation("GetMessageAuthor2", messageId, options);
  }

  private async getAuthorByOperation(operation: "GetMessageAuthor" | "GetMessageAuthor2", messageId: string, options: { signal?: AbortSignal }): Promise<MessageAuthorResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml(
      operation,
      idRequest(operation, messageId),
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertOk(rawXml);
    const userType = firstText(rawXml, "userType");
    const authorName = firstText(rawXml, "authorName");
    return {
      statusCode,
      statusMessage,
      ...(userType ? { userType } : {}),
      ...(authorName ? { authorName } : {}),
      rawXml,
    };
  }
}
