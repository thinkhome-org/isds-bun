// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { IsdsSoapFaultError } from "../errors/index.ts";
import { assertSafeXml, firstElementText } from "../xml/index.ts";

export type SoapVersion = "1.1" | "1.2";

export interface SoapEnvelopeOptions {
  readonly version: SoapVersion;
  readonly bodyXml: string;
  readonly headerXml?: string;
}

const SOAP_NS: Record<SoapVersion, string> = {
  "1.1": "http://schemas.xmlsoap.org/soap/envelope/",
  "1.2": "http://www.w3.org/2003/05/soap-envelope",
};

export function soapContentType(version: SoapVersion, action?: string): string {
  if (version === "1.1") return "text/xml; charset=utf-8";
  return action
    ? `application/soap+xml; charset=utf-8; action="${action}"`
    : "application/soap+xml; charset=utf-8";
}

export function createSoapEnvelope(options: SoapEnvelopeOptions): string {
  const ns = SOAP_NS[options.version];
  return `<?xml version="1.0" encoding="UTF-8"?>` +
    `<soap:Envelope xmlns:soap="${ns}">` +
    (options.headerXml ? `<soap:Header>${options.headerXml}</soap:Header>` : "") +
    `<soap:Body>${options.bodyXml}</soap:Body>` +
    `</soap:Envelope>`;
}

export function throwIfSoapFault(xml: string): void {
  assertSafeXml(xml);
  if (!/<(?:[\w.-]+:)?Fault(?:\s|>)/.test(xml)) return;

  const code = firstElementText(xml, "faultcode") ?? firstElementText(xml, "Value") ?? "SOAP_FAULT";
  const message = firstElementText(xml, "faultstring") ?? firstElementText(xml, "Text") ?? "SOAP Fault";
  throw new IsdsSoapFaultError(message, { faultCode: code });
}
