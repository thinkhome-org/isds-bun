// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { IsdsConfigurationError, IsdsStatusError } from "../errors/index.ts";
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

export type SentMessageEnvelopeDownloadResult = MessageEnvelopeDownloadResult;

export interface StatusOnlyResult {
  readonly statusCode: string;
  readonly statusMessage: string;
  readonly rawXml: string;
}

export type MarkMessageAsDownloadedResult = StatusOnlyResult;

export interface EraseMessageOptions {
  readonly incoming: boolean;
  readonly signal?: AbortSignal;
}

export type EraseMessageResult = StatusOnlyResult;

export interface MessageHash {
  readonly value: string;
  readonly algorithm?: string;
}

export interface VerifyMessageResult {
  readonly statusCode: string;
  readonly statusMessage: string;
  readonly hash?: MessageHash;
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

export interface GetErasedMessagesListOptions {
  readonly fromDate?: Date | string;
  readonly toDate?: Date | string;
  readonly year?: number;
  readonly month?: number;
  readonly messageType: "SENT" | "RECEIVED";
  readonly outputFormat?: "XML" | "CSV";
  readonly signal?: AbortSignal;
}

export interface GetErasedMessagesListResult {
  readonly statusCode: string;
  readonly statusMessage: string;
  readonly asyncId?: string;
  readonly rawXml: string;
}

export interface PickUpAsyncResponseResult {
  readonly statusCode: string;
  readonly statusMessage: string;
  readonly asyncReqType?: string;
  readonly asyncResponse?: string;
  readonly rawXml: string;
}

export interface NotificationRecord {
  readonly type?: number;
  readonly messageId?: string;
  readonly personalDelivery?: number;
  readonly deliveryTime?: string;
  readonly recipientBoxId?: string;
  readonly annotation?: string;
  readonly senderBoxId?: string;
  readonly sender?: string;
}

export interface GetNotificationsOptions {
  readonly fromTime: Date | string;
  readonly scope: string;
  readonly signal?: AbortSignal;
}

export interface GetNotificationsResult {
  readonly statusCode: string;
  readonly statusMessage: string;
  readonly records: readonly NotificationRecord[];
  readonly listContinues?: boolean;
  readonly rawXml: string;
}

export interface RegisterForNotificationsOptions {
  readonly action: number;
  readonly signal?: AbortSignal;
}

export type RegisterForNotificationsResult = StatusOnlyResult;

export interface ReportSuspiciousMessageOptions {
  readonly reporterName?: string;
  readonly reporterEmail?: string;
  readonly reporterPhone?: string;
  readonly allowComplete: boolean;
  readonly note?: string;
  readonly signal?: AbortSignal;
}

export type ReportSuspiciousMessageResult = StatusOnlyResult;

function nilElement(name: string): string {
  return `<${name} xsi:nil="true"/>`;
}

function valueElement(name: string, value: string | number | boolean | Date | null | undefined): string {
  if (value === null || value === undefined) return nilElement(name);
  const text = value instanceof Date ? value.toISOString() : String(value);
  return `<${name}>${escapeXmlText(text)}</${name}>`;
}

function dateElement(name: string, value: Date | string): string {
  const text = value instanceof Date ? value.toISOString().slice(0, 10) : value;
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

function booleanFrom(xml: string, name: string): boolean | undefined {
  const text = firstText(xml, name);
  if (text === "true" || text === "1") return true;
  if (text === "false" || text === "0") return false;
  return undefined;
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

function parseHash(xml: string): MessageHash | undefined {
  const match = /<((?:[\w.-]+:)?dmHash)([^>]*)>([\s\S]*?)<\/\1>/.exec(xml);
  if (!match?.[3]) return undefined;
  const algorithm = attr(match[2] ?? "", "algorithm");
  return {
    value: firstText(xml, "dmHash") ?? match[3],
    ...(algorithm ? { algorithm } : {}),
  };
}

function parseNotificationRecords(xml: string): NotificationRecord[] {
  const records: NotificationRecord[] = [];
  for (const match of xml.matchAll(/<((?:[\w.-]+:)?ntfRecord)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)) {
    const body = match[2] ?? "";
    const record: Record<string, unknown> = {};
    const fields = {
      type: numberFrom(body, "ntfType"),
      messageId: firstText(body, "dmID"),
      personalDelivery: numberFrom(body, "dmPersonalDelivery"),
      deliveryTime: firstText(body, "dmDeliveryTime"),
      recipientBoxId: firstText(body, "dbIDRecipient"),
      annotation: firstText(body, "dmAnnotation"),
      senderBoxId: firstText(body, "dbIDSender"),
      sender: firstText(body, "dmSender"),
    };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) record[key] = value;
    }
    records.push(record as NotificationRecord);
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
    return this.downloadEnvelopeByOperation("MessageEnvelopeDownload", messageId, options);
  }

  async downloadSentEnvelope(messageId: string, options: { signal?: AbortSignal } = {}): Promise<SentMessageEnvelopeDownloadResult> {
    return this.downloadEnvelopeByOperation("SentMessageEnvelopeDownload", messageId, options);
  }

  private async downloadEnvelopeByOperation(operation: "MessageEnvelopeDownload" | "SentMessageEnvelopeDownload", messageId: string, options: { signal?: AbortSignal }): Promise<MessageEnvelopeDownloadResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml(
      operation,
      idRequest(operation, messageId),
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

  async markAsDownloaded(messageId: string, options: { signal?: AbortSignal } = {}): Promise<MarkMessageAsDownloadedResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml(
      "MarkMessageAsDownloaded",
      idRequest("MarkMessageAsDownloaded", messageId),
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertOk(rawXml);
    return { statusCode, statusMessage, rawXml };
  }

  async verifyMessage(messageId: string, options: { signal?: AbortSignal } = {}): Promise<VerifyMessageResult> {
    await this.ensureInitialized();
    const rawXml = await this.raw.invokeGeneratedXml(
      "VerifyMessage",
      idRequest("VerifyMessage", messageId),
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertOk(rawXml);
    const hash = parseHash(rawXml);
    return {
      statusCode,
      statusMessage,
      ...(hash ? { hash } : {}),
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

  async eraseMessage(messageId: string, options: EraseMessageOptions): Promise<EraseMessageResult> {
    if (!options || typeof options.incoming !== "boolean") {
      throw new IsdsConfigurationError("EraseMessage requires an explicit incoming flag.");
    }
    await this.ensureInitialized();
    const bodyXml = `<EraseMessage xmlns="http://isds.czechpoint.cz/v20">` +
      `<dmID>${escapeXmlText(messageId)}</dmID>` +
      valueElement("dmIncoming", options.incoming) +
      `</EraseMessage>`;
    const rawXml = await this.raw.invokeGeneratedXml(
      "EraseMessage",
      bodyXml,
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertOk(rawXml);
    return { statusCode, statusMessage, rawXml };
  }

  async getErasedMessagesList(options: GetErasedMessagesListOptions): Promise<GetErasedMessagesListResult> {
    if (!options) {
      throw new IsdsConfigurationError("GetListOfErasedMessages options are required.");
    }
    if (options.messageType !== "SENT" && options.messageType !== "RECEIVED") {
      throw new IsdsConfigurationError("GetListOfErasedMessages messageType must be SENT or RECEIVED.");
    }
    if (options.outputFormat !== undefined && options.outputFormat !== "XML" && options.outputFormat !== "CSV") {
      throw new IsdsConfigurationError("GetListOfErasedMessages outputFormat must be XML or CSV.");
    }
    const hasRange = options.fromDate !== undefined || options.toDate !== undefined;
    const hasYear = options.year !== undefined;
    if ((hasRange && hasYear) || (hasRange && (!options.fromDate || !options.toDate)) || (!hasRange && !hasYear)) {
      throw new IsdsConfigurationError("GetListOfErasedMessages requires either fromDate/toDate or year/month.");
    }

    await this.ensureInitialized();
    const dateChoice = hasRange
      ? dateElement("dmFromDate", options.fromDate as Date | string) + dateElement("dmToDate", options.toDate as Date | string)
      : valueElement("dmYear", options.year) + (options.month === undefined ? "" : valueElement("dmMonth", options.month));
    const bodyXml = `<GetListOfErasedMessages xmlns="http://isds.czechpoint.cz/v20">` +
      dateChoice +
      `<dmMessageType>${escapeXmlText(options.messageType)}</dmMessageType>` +
      `<dmOutFormat>${escapeXmlText(options.outputFormat ?? "XML")}</dmOutFormat>` +
      `</GetListOfErasedMessages>`;
    const rawXml = await this.raw.invokeGeneratedXml(
      "GetListOfErasedMessages",
      bodyXml,
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertOk(rawXml);
    const asyncId = firstText(rawXml, "asyncID");
    return {
      statusCode,
      statusMessage,
      ...(asyncId ? { asyncId } : {}),
      rawXml,
    };
  }

  async pickUpAsyncResponse(asyncId: string, asyncReqType: string, options: { signal?: AbortSignal } = {}): Promise<PickUpAsyncResponseResult> {
    await this.ensureInitialized();
    const bodyXml = `<PickUpAsyncResponse xmlns="http://isds.czechpoint.cz/v20">` +
      `<asyncID>${escapeXmlText(asyncId)}</asyncID>` +
      `<asyncReqType>${escapeXmlText(asyncReqType)}</asyncReqType>` +
      `</PickUpAsyncResponse>`;
    const rawXml = await this.raw.invokeGeneratedXml(
      "PickUpAsyncResponse",
      bodyXml,
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertOk(rawXml);
    const returnedType = firstText(rawXml, "asyncReqType");
    const asyncResponse = firstText(rawXml, "asyncResponse");
    return {
      statusCode,
      statusMessage,
      ...(returnedType ? { asyncReqType: returnedType } : {}),
      ...(asyncResponse ? { asyncResponse } : {}),
      rawXml,
    };
  }

  async getNotifications(options: GetNotificationsOptions): Promise<GetNotificationsResult> {
    if (!options?.fromTime) {
      throw new IsdsConfigurationError("GetListForNotifications requires fromTime.");
    }
    if (!options.scope) {
      throw new IsdsConfigurationError("GetListForNotifications requires scope.");
    }
    await this.ensureInitialized();
    const fromTime = options.fromTime instanceof Date ? options.fromTime.toISOString() : options.fromTime;
    const bodyXml = `<GetListForNotifications xmlns="http://isds.czechpoint.cz/v20">` +
      `<ntfFromTime>${escapeXmlText(fromTime)}</ntfFromTime>` +
      `<ntfScope>${escapeXmlText(options.scope)}</ntfScope>` +
      `</GetListForNotifications>`;
    const rawXml = await this.raw.invokeGeneratedXml(
      "GetListForNotifications",
      bodyXml,
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertOk(rawXml);
    const listContinues = booleanFrom(rawXml, "ntfListContinues");
    return {
      statusCode,
      statusMessage,
      records: parseNotificationRecords(rawXml),
      ...(listContinues !== undefined ? { listContinues } : {}),
      rawXml,
    };
  }

  async registerForNotifications(options: RegisterForNotificationsOptions): Promise<RegisterForNotificationsResult> {
    if (!Number.isInteger(options?.action)) {
      throw new IsdsConfigurationError("RegisterForNotifications requires an integer action.");
    }
    await this.ensureInitialized();
    const bodyXml = `<RegisterForNotifications xmlns="http://isds.czechpoint.cz/v20">` +
      valueElement("action", options.action) +
      `</RegisterForNotifications>`;
    const rawXml = await this.raw.invokeGeneratedXml(
      "RegisterForNotifications",
      bodyXml,
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertOk(rawXml);
    return { statusCode, statusMessage, rawXml };
  }

  async reportSuspiciousMessage(messageId: string, options: ReportSuspiciousMessageOptions): Promise<ReportSuspiciousMessageResult> {
    if (!options || typeof options.allowComplete !== "boolean") {
      throw new IsdsConfigurationError("SuspMessageReport requires an explicit allowComplete flag.");
    }
    await this.ensureInitialized();
    const bodyXml = `<SuspMessageReport xmlns="http://isds.czechpoint.cz/v20">` +
      `<dmID>${escapeXmlText(messageId)}</dmID>` +
      (options.reporterName === undefined ? "" : valueElement("repName", options.reporterName)) +
      (options.reporterEmail === undefined ? "" : valueElement("repMail", options.reporterEmail)) +
      (options.reporterPhone === undefined ? "" : valueElement("repTel", options.reporterPhone)) +
      valueElement("allowComplete", options.allowComplete) +
      (options.note === undefined ? "" : valueElement("note", options.note)) +
      `</SuspMessageReport>`;
    const rawXml = await this.raw.invokeGeneratedXml(
      "SuspMessageReport",
      bodyXml,
      options.signal ? { signal: options.signal } : {},
    );
    const { statusCode, statusMessage } = assertOk(rawXml);
    return { statusCode, statusMessage, rawXml };
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
