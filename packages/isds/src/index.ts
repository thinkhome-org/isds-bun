// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

export { createIsdsClient, type CreateIsdsClientOptions, type IsdsClient } from "./client/index.ts";
export { resolveEnvironment, type IsdsEnvironment, type IsdsEndpointMap } from "./config/environment.ts";
export { type IsdsAuthentication, PasswordAuthAdapter } from "./auth/index.ts";
export { type IsdsCapabilities } from "./capabilities/index.ts";
export {
  MessagesClient,
  type ListReceivedMessagesOptions,
  type ListReceivedMessagesResult,
  type ListSentMessagesOptions,
  type ListSentMessagesResult,
  type DeliveryEvent,
  type DeliveryInfoResult,
  type MessageEnvelopeDownloadResult,
  type ReceivedMessageRecord,
  type SignedDeliveryInfoResult,
  type SentMessageRecord,
} from "./messages/index.ts";
export * from "./xml/index.ts";
export * from "./soap/index.ts";
export * from "./mtom/index.ts";
export * from "./errors/index.ts";
