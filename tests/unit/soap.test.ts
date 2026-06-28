// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { expect, test } from "bun:test";
import { createSoapEnvelope, IsdsSoapFaultError, soapContentType, throwIfSoapFault } from "../../packages/isds/src/index.ts";

test("creates SOAP 1.2 envelope and content type", () => {
  expect(createSoapEnvelope({ version: "1.2", bodyXml: "<x/>" })).toContain("http://www.w3.org/2003/05/soap-envelope");
  expect(soapContentType("1.2", "urn:test")).toContain("application/soap+xml");
});

test("throws typed SOAP fault", () => {
  expect(() => throwIfSoapFault("<Envelope><Body><Fault><faultcode>x</faultcode><faultstring>broken</faultstring></Fault></Body></Envelope>"))
    .toThrow(IsdsSoapFaultError);
});
