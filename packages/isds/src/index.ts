// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

export { createIsdsClient, type CreateIsdsClientOptions, type IsdsClient } from "./client/index.ts";
export { resolveEnvironment, type IsdsEnvironment, type IsdsEndpointMap } from "./config/environment.ts";
export { type IsdsAuthentication, PasswordAuthAdapter } from "./auth/index.ts";
export { type IsdsCapabilities } from "./capabilities/index.ts";
export {
  MessagesClient,
  type AuthenticateMessageResult,
  type ListReceivedMessagesOptions,
  type ListReceivedMessagesResult,
  type ListSentMessagesOptions,
  type ListSentMessagesResult,
  type DeliveryEvent,
  type DeliveryInfoResult,
  type DownloadedMessageFile,
  type EraseMessageOptions,
  type EraseMessageResult,
  type GetErasedMessagesListOptions,
  type GetErasedMessagesListResult,
  type GetMessageStateChangesOptions,
  type GetMessageStateChangesResult,
  type GetNotificationsOptions,
  type GetNotificationsResult,
  type MarkMessageAsDownloadedResult,
  type MessageHash,
  type MessageAuthorResult,
  type MessageDownloadResult,
  type MessageEnvelopeDownloadResult,
  type MessageStateChange,
  type NotificationRecord,
  type PickUpAsyncResponseResult,
  type ReceivedMessageRecord,
  type RegisterForNotificationsOptions,
  type RegisterForNotificationsResult,
  type ReportSuspiciousMessageOptions,
  type ReportSuspiciousMessageResult,
  type ReSignISDSDocumentResult,
  type SentMessageEnvelopeDownloadResult,
  type SignedDeliveryInfoResult,
  type SignedMessageDownloadResult,
  type SentMessageRecord,
  type StatusOnlyResult,
  type VerifyMessageResult,
} from "./messages/index.ts";
export * from "./xml/index.ts";
export * from "./soap/index.ts";
export * from "./mtom/index.ts";
export * from "./errors/index.ts";
