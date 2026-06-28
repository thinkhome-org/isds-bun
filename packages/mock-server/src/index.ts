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
      if (body.includes("VerifyMessage")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><VerifyMessageResponse xmlns="http://isds.czechpoint.cz/v20"><dmHash algorithm="SHA-256">SEFTSA==</dmHash><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></VerifyMessageResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("SignedSentMessageDownload")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><SignedSentMessageDownloadResponse xmlns="http://isds.czechpoint.cz/v20"><dmSignature>U0lHTkVEX1NFTlQ=</dmSignature><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></SignedSentMessageDownloadResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("SignedMessageDownload")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><SignedMessageDownloadResponse xmlns="http://isds.czechpoint.cz/v20"><dmSignature>U0lHTkVEX1JFQ0VJVkVE</dmSignature><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></SignedMessageDownloadResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("MessageDownload")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><MessageDownloadResponse xmlns="http://isds.czechpoint.cz/v20"><dmReturnedMessage><dmDm><dmID>123456</dmID><dbIDSender>abc123</dbIDSender><dmSender>Sender</dmSender><dmSenderAddress>Address</dmSenderAddress><dmSenderType>10</dmSenderType><dmRecipient>Recipient</dmRecipient><dmRecipientAddress>Recipient Address</dmRecipientAddress><dmAnnotation>Downloaded Test</dmAnnotation><dmFiles><dmFile dmMimeType="text/plain" dmFileMetaType="main" dmFileDescr="hello.txt" dmFileGuid="file-1"><dmEncodedContent>SGVsbG8=</dmEncodedContent></dmFile></dmFiles></dmDm><dmHash algorithm="SHA-256">SEFTSA==</dmHash><dmQTimestamp>VElNRVNUQU1Q</dmQTimestamp></dmReturnedMessage><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></MessageDownloadResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("AuthenticateMessage")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><AuthenticateMessageResponse xmlns="http://isds.czechpoint.cz/v20"><dmAuthResult>true</dmAuthResult><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></AuthenticateMessageResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("Re-signISDSDocument")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><Re-signISDSDocumentResponse xmlns="http://isds.czechpoint.cz/v20"><dmResultDoc>UkVTSUdORUQ=</dmResultDoc><dmValidTo>2027-06-28</dmValidTo><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></Re-signISDSDocumentResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("DummyOperation")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><DummyOperationResponse xmlns="http://isds.czechpoint.cz/v20"><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></DummyOperationResponse></soap:Body></soap:Envelope>`,
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
      if (body.includes("SentMessageEnvelopeDownload")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><SentMessageEnvelopeDownloadResponse xmlns="http://isds.czechpoint.cz/v20"><dmReturnedMessageEnvelope dmType="O" dmVODZ="false" attsNum="1"><dmDm><dmID>654321</dmID><dbIDSender>abc123</dbIDSender><dmSender>Sender</dmSender><dmSenderAddress>Address</dmSenderAddress><dmSenderType>10</dmSenderType><dmRecipient>Recipient</dmRecipient><dmRecipientAddress>Recipient Address</dmRecipientAddress><dmAnnotation>Sent Envelope Test</dmAnnotation></dmDm><dmHash>HASH</dmHash><dmQTimestamp>TIMESTAMP</dmQTimestamp><dmDeliveryTime>2026-06-28T00:00:00Z</dmDeliveryTime><dmAcceptanceTime>2026-06-28T00:00:00Z</dmAcceptanceTime><dmMessageStatus>3</dmMessageStatus><dmAttachmentSize>1</dmAttachmentSize></dmReturnedMessageEnvelope><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></SentMessageEnvelopeDownloadResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("MessageEnvelopeDownload")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><MessageEnvelopeDownloadResponse xmlns="http://isds.czechpoint.cz/v20"><dmReturnedMessageEnvelope dmType="V" dmVODZ="false" attsNum="1"><dmDm><dmID>123456</dmID><dbIDSender>abc123</dbIDSender><dmSender>Sender</dmSender><dmSenderAddress>Address</dmSenderAddress><dmSenderType>10</dmSenderType><dmRecipient>Recipient</dmRecipient><dmRecipientAddress>Recipient Address</dmRecipientAddress><dmAnnotation>Envelope Test</dmAnnotation></dmDm><dmHash>HASH</dmHash><dmQTimestamp>TIMESTAMP</dmQTimestamp><dmDeliveryTime>2026-06-28T00:00:00Z</dmDeliveryTime><dmAcceptanceTime>2026-06-28T00:00:00Z</dmAcceptanceTime><dmMessageStatus>4</dmMessageStatus><dmAttachmentSize>1</dmAttachmentSize></dmReturnedMessageEnvelope><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></MessageEnvelopeDownloadResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("MarkMessageAsDownloaded")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><MarkMessageAsDownloadedResponse xmlns="http://isds.czechpoint.cz/v20"><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></MarkMessageAsDownloadedResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetDeliveryInfo")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetDeliveryInfoResponse xmlns="http://isds.czechpoint.cz/v20"><dmDelivery><dmDm><dmID>123456</dmID><dbIDSender>abc123</dbIDSender><dmSender>Sender</dmSender><dmSenderAddress>Address</dmSenderAddress><dmSenderType>10</dmSenderType><dmRecipient>Recipient</dmRecipient><dmRecipientAddress>Recipient Address</dmRecipientAddress><dmAnnotation>Delivery Test</dmAnnotation></dmDm><dmHash>HASH</dmHash><dmQTimestamp>TIMESTAMP</dmQTimestamp><dmDeliveryTime>2026-06-28T00:00:00Z</dmDeliveryTime><dmAcceptanceTime>2026-06-28T00:00:00Z</dmAcceptanceTime><dmMessageStatus>4</dmMessageStatus><dmEvents><dmEvent><dmEventTime>2026-06-28T00:00:00Z</dmEventTime><dmEventDescr>Delivered</dmEventDescr></dmEvent></dmEvents></dmDelivery><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></GetDeliveryInfoResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetSignedDeliveryInfo")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetSignedDeliveryInfoResponse xmlns="http://isds.czechpoint.cz/v20"><dmSignature>U0lHTkFUVVJF</dmSignature><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></GetSignedDeliveryInfoResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetMessageStateChanges")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetMessageStateChangesResponse xmlns="http://isds.czechpoint.cz/v20"><dmRecords><dmRecord><dmID>123456</dmID><dmEventTime>2026-06-28T00:00:00Z</dmEventTime><dmMessageStatus>4</dmMessageStatus></dmRecord></dmRecords><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></GetMessageStateChangesResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetMessageAuthor2")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetMessageAuthor2Response xmlns="http://isds.czechpoint.cz/v20"><userType>PRIMARY</userType><authorName>Author Two</authorName><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></GetMessageAuthor2Response></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetMessageAuthor")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetMessageAuthorResponse xmlns="http://isds.czechpoint.cz/v20"><userType>PRIMARY</userType><authorName>Author One</authorName><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></GetMessageAuthorResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("EraseMessage")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><EraseMessageResponse xmlns="http://isds.czechpoint.cz/v20"><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></EraseMessageResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("PickUpAsyncResponse")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><PickUpAsyncResponseResponse xmlns="http://isds.czechpoint.cz/v20"><asyncReqType>GetListOfErasedMessages</asyncReqType><asyncResponse>RVJBU0VE</asyncResponse><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></PickUpAsyncResponseResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetListOfErasedMessages")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetListOfErasedMessagesResponse xmlns="http://isds.czechpoint.cz/v20"><asyncID>async-123</asyncID><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></GetListOfErasedMessagesResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetListForNotifications")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetListForNotificationsResponse xmlns="http://isds.czechpoint.cz/v20"><ntfRecords><ntfRecord><ntfType>1</ntfType><dmID>123456</dmID><dmPersonalDelivery>0</dmPersonalDelivery><dmDeliveryTime>2026-06-28T00:00:00Z</dmDeliveryTime><dbIDRecipient>rcpt01</dbIDRecipient><dmAnnotation>Notification</dmAnnotation><dbIDSender>sndr01</dbIDSender><dmSender>Sender</dmSender></ntfRecord></ntfRecords><ntfListContinues>false</ntfListContinues><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></GetListForNotificationsResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("RegisterForNotifications")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><RegisterForNotificationsResponse xmlns="http://isds.czechpoint.cz/v20"><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></RegisterForNotificationsResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("SuspMessageReport")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><SuspMessageReportResponse xmlns="http://isds.czechpoint.cz/v20"><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></SuspMessageReportResponse></soap:Body></soap:Envelope>`,
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
