// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

export interface MockIsdsServerOptions {
  readonly port?: number;
  readonly username?: string;
  readonly password?: string;
}

export function startMockIsdsServer(options: MockIsdsServerOptions = {}): ReturnType<typeof Bun.serve> {
  const username = options.username ?? "test";
  const password = options.password ?? "test";
  const expectedAuth = `Basic ${btoa(`${username}:${password}`)}`;

  return Bun.serve({
    port: options.port ?? 0,
    async fetch(request) {
      if (request.headers.get("authorization") !== expectedAuth) {
        return new Response("Unauthorized", { status: 401 });
      }
      const body = await request.text();
      if (body.includes("FaultPlease")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><soap:Fault><faultcode>mock</faultcode><faultstring>Mock fault</faultstring></soap:Fault></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetListOfReceivedMessages")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetListOfReceivedMessagesResponse xmlns="http://isds.czechpoint.cz/v20"><dmRecords><dmRecord dmType="V" dmVODZ="false"><dmOrdinal>1</dmOrdinal><dmID>123456</dmID><dbIDSender>abc123</dbIDSender><dmSender>Sender</dmSender><dmSenderAddress>Address</dmSenderAddress><dmSenderType>10</dmSenderType><dmRecipient>Recipient</dmRecipient><dmRecipientAddress>Recipient Address</dmRecipientAddress><dmAnnotation>Test</dmAnnotation><dmMessageStatus>4</dmMessageStatus><dmAttachmentSize>1</dmAttachmentSize><dmDeliveryTime>2026-06-28T00:00:00Z</dmDeliveryTime><dmAcceptanceTime>2026-06-28T00:00:00Z</dmAcceptanceTime></dmRecord></dmRecords><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></GetListOfReceivedMessagesResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetListOfSentMessages")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetListOfSentMessagesResponse xmlns="http://isds.czechpoint.cz/v20"><dmRecords><dmRecord dmType="O" dmVODZ="false"><dmOrdinal>1</dmOrdinal><dmID>654321</dmID><dbIDSender>abc123</dbIDSender><dmSender>Sender</dmSender><dmSenderAddress>Address</dmSenderAddress><dmSenderType>10</dmSenderType><dmRecipient>Recipient</dmRecipient><dmRecipientAddress>Recipient Address</dmRecipientAddress><dmAnnotation>Sent Test</dmAnnotation><dmMessageStatus>3</dmMessageStatus><dmAttachmentSize>2</dmAttachmentSize><dmDeliveryTime>2026-06-28T00:00:00Z</dmDeliveryTime><dmAcceptanceTime>2026-06-28T00:00:00Z</dmAcceptanceTime></dmRecord></dmRecords><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></GetListOfSentMessagesResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      return new Response(
        `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><mock:Ok xmlns:mock="urn:thinkhome:isds:mock">ok</mock:Ok></soap:Body></soap:Envelope>`,
        { headers: { "Content-Type": "text/xml" } },
      );
    },
  });
}
