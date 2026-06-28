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
      if (body.includes("GetOwnerInfoFromLogin2")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetOwnerInfoFromLogin2Response xmlns="http://isds.czechpoint.cz/v20"><dbOwnerInfo><dbID>abc123</dbID><aifoIsds>true</aifoIsds><dbType>PO</dbType><ic>12345678</ic><firmName>ThinkHome s.r.o.</firmName><adCity>Praha</adCity><adZipCode>11000</adZipCode><dbState>1</dbState><dbOpenAddressing>true</dbOpenAddressing><dbIdOVM>ovm-1</dbIdOVM></dbOwnerInfo><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></GetOwnerInfoFromLogin2Response></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetOwnerInfoFromLogin")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetOwnerInfoFromLoginResponse xmlns="http://isds.czechpoint.cz/v20"><dbOwnerInfo><dbID>abc123</dbID><dbType>PO</dbType><ic>12345678</ic><firmName>ThinkHome s.r.o.</firmName><adCity>Praha</adCity><dbState>1</dbState></dbOwnerInfo><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></GetOwnerInfoFromLoginResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetUserInfoFromLogin2")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetUserInfoFromLogin2Response xmlns="http://isds.czechpoint.cz/v20"><dbUserInfo><aifoIsds>true</aifoIsds><pnFirstName>Test</pnFirstName><pnLastName>User</pnLastName><adCity>Praha</adCity><isdsID>isds-user-1</isdsID><userType>PRIMARY_USER</userType><userPrivils>255</userPrivils></dbUserInfo><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></GetUserInfoFromLogin2Response></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetUserInfoFromLogin")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetUserInfoFromLoginResponse xmlns="http://isds.czechpoint.cz/v20"><dbUserInfo><pnFirstName>Test</pnFirstName><pnLastName>User</pnLastName><adCity>Praha</adCity><userID>usr001</userID><userType>PRIMARY_USER</userType><userPrivils>255</userPrivils></dbUserInfo><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></GetUserInfoFromLoginResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetPasswordInfo")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetPasswordInfoResponse xmlns="http://isds.czechpoint.cz/v20"><pswExpDate>2027-01-01T00:00:00+01:00</pswExpDate><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></GetPasswordInfoResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("ChangeISDSPassword")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ChangeISDSPasswordResponse xmlns="http://isds.czechpoint.cz/v20"><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></ChangeISDSPasswordResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("FindDataBox2")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><FindDataBox2Response xmlns="http://isds.czechpoint.cz/v20"><dbResults><dbOwnerInfo><dbID>abc123</dbID><aifoIsds>true</aifoIsds><dbType>PO</dbType><ic>12345678</ic><firmName>ThinkHome s.r.o.</firmName><adCity>Praha</adCity><dbState>1</dbState><dbOpenAddressing>true</dbOpenAddressing></dbOwnerInfo></dbResults><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></FindDataBox2Response></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("FindDataBox")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><FindDataBoxResponse xmlns="http://isds.czechpoint.cz/v20"><dbResults><dbOwnerInfo><dbID>abc123</dbID><dbType>PO</dbType><ic>12345678</ic><firmName>ThinkHome s.r.o.</firmName><adCity>Praha</adCity><dbState>1</dbState></dbOwnerInfo></dbResults><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></FindDataBoxResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("CheckDataBox")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><CheckDataBoxResponse xmlns="http://isds.czechpoint.cz/v20"><dbState>1</dbState><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></CheckDataBoxResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetDataBoxList")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetDataBoxListResponse xmlns="http://isds.czechpoint.cz/v20"><dblData>REJMSVNURA==</dblData><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></GetDataBoxListResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("PDZInfo")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><PDZInfoResponse xmlns="http://isds.czechpoint.cz/v20"><dbPDZRecords><dbPDZRecord><PDZType>K</PDZType><PDZRecip>def456</PDZRecip><PDZPayer>abc123</PDZPayer><PDZExpire>2027-01-01T00:00:00+01:00</PDZExpire><PDZCnt>5</PDZCnt><ODZIdent>odz-1</ODZIdent></dbPDZRecord></dbPDZRecords><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></PDZInfoResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("DataBoxCreditInfo")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><DataBoxCreditInfoResponse xmlns="http://isds.czechpoint.cz/v20"><currentCredit>100</currentCredit><notifEmail>ops@example.test</notifEmail><ciRecords><ciRecord><ciEventTime>2026-06-28T00:00:00+02:00</ciEventTime><ciEventType>1</ciEventType><ciCreditChange>100</ciCreditChange><ciCreditAfter>100</ciCreditAfter><ciTransID>tx-1</ciTransID></ciRecord></ciRecords><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></DataBoxCreditInfoResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("ISDSSearch3")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ISDSSearch3Response xmlns="http://isds.czechpoint.cz/v20"><totalCount>1</totalCount><currentCount>1</currentCount><position>1</position><lastPage>true</lastPage><dbResults><dbResult><dbID>abc123</dbID><dbType>PO</dbType><dbName>ThinkHome s.r.o.</dbName><dbAddress>Praha</dbAddress><dbBiDate>2020-01-01</dbBiDate><dbICO>12345678</dbICO><dbIdOVM>ovm-1</dbIdOVM><dbSendOptions>ALL</dbSendOptions></dbResult></dbResults><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></ISDSSearch3Response></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("ISDSSearch2")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ISDSSearch2Response xmlns="http://isds.czechpoint.cz/v20"><totalCount>1</totalCount><currentCount>1</currentCount><position>1</position><lastPage>true</lastPage><dbResults><dbResult><dbID>abc123</dbID><dbType>PO</dbType><dbName>ThinkHome s.r.o.</dbName><dbAddress>Praha</dbAddress><dbBiDate>2020-01-01</dbBiDate><dbICO>12345678</dbICO><dbEffectiveOVM>false</dbEffectiveOVM><dbSendOptions>ALL</dbSendOptions></dbResult></dbResults><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></ISDSSearch2Response></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetDataBoxActivityStatus")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetDataBoxActivityStatusResponse xmlns="http://isds.czechpoint.cz/v20"><dbID>abc123</dbID><Periods><Period><PeriodFrom>2026-01-01T00:00:00+01:00</PeriodFrom><PeriodTo>2026-12-31T23:59:59+01:00</PeriodTo><DbState>1</DbState></Period></Periods><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></GetDataBoxActivityStatusResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("FindPersonalDataBox")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><FindPersonalDataBoxResponse xmlns="http://isds.czechpoint.cz/v20"><dbResults><dbOwnerInfo><dbID>pers01</dbID><aifoIsds>true</aifoIsds><pnFirstName>Personal</pnFirstName><pnLastName>Owner</pnLastName><adCity>Praha</adCity></dbOwnerInfo></dbResults><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></FindPersonalDataBoxResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("DTInfo")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><DTInfoResponse xmlns="http://isds.czechpoint.cz/v20"><ActDTType>1</ActDTType><ActDTCapacity>1000</ActDTCapacity><ActDTFrom>2026-01-01</ActDTFrom><ActDTTo>2026-12-31</ActDTTo><ActDTCapUsed>10</ActDTCapUsed><FutDTType>2</FutDTType><FutDTCapacity>2000</FutDTCapacity><FutDTFrom>2027-01-01</FutDTFrom><FutDTTo>2027-12-31</FutDTTo><FutDTPaid>1</FutDTPaid><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></DTInfoResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("PDZSendInfo")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><PDZSendInfoResponse xmlns="http://isds.czechpoint.cz/v20"><PDZsiResult>true</PDZsiResult><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></PDZSendInfoResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetConstants")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetConstantsResponse xmlns="http://isds.czechpoint.cz/v20"><constRecords><constRecord><cName>MAX_ATTACHMENT_SIZE</cName><cValue>20MB</cValue><cFrom>2026-01-01</cFrom><cTo>2026-12-31</cTo></constRecord></constRecords><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></GetConstantsResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("GetDataBoxAddress")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><GetDataBoxAddressResponse xmlns="http://isds.czechpoint.cz/v20"><adCity>Praha</adCity><adDistrict>Praha 1</adDistrict><adStreet>Testovaci</adStreet><adNumberInStreet>1</adNumberInStreet><adNumberInMunicipality>10</adNumberInMunicipality><adZipCode>11000</adZipCode><adState>CZ</adState><adRegistrationNumber>reg-1</adRegistrationNumber><adFullAddress1>Testovaci 1, Praha</adFullAddress1><adFullAddress2>CZ</adFullAddress2><dbStatus><dbStatusCode>0000</dbStatusCode><dbStatusMessage>OK</dbStatusMessage></dbStatus></GetDataBoxAddressResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("CreateMultipleMessage")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><CreateMultipleMessageResponse xmlns="http://isds.czechpoint.cz/v20"><dmMultipleStatus><dmSingleStatus><dmID>multi-1</dmID><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></dmSingleStatus><dmSingleStatus><dmID>multi-2</dmID><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></dmSingleStatus></dmMultipleStatus><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></CreateMultipleMessageResponse></soap:Body></soap:Envelope>`,
          { headers: { "Content-Type": "text/xml" } },
        );
      }
      if (body.includes("CreateMessage")) {
        return new Response(
          `<?xml version="1.0"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><CreateMessageResponse xmlns="http://isds.czechpoint.cz/v20"><dmID>created-1</dmID><dmStatus><dmStatusCode>0000</dmStatusCode><dmStatusMessage>OK</dmStatusMessage></dmStatus></CreateMessageResponse></soap:Body></soap:Envelope>`,
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
