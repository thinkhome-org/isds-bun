// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import { createSoapEnvelope, soapContentType, throwIfSoapFault, type SoapVersion } from "../soap/index.ts";
import type { BunFetchTransport } from "../transport/index.ts";
import { GENERATED_OPERATIONS } from "./operations.generated.ts";
import { IsdsUnsupportedOperationError } from "../errors/index.ts";
export { GENERATED_OPERATIONS } from "./operations.generated.ts";

export interface RawOperationMetadata {
  readonly operation: string;
  readonly service: string;
  readonly port?: string;
  readonly binding?: string;
  readonly endpointCategory: string;
  readonly endpoint?: string;
  readonly soapAction?: string;
  readonly soapVersion: SoapVersion;
  readonly idempotent: boolean;
  readonly requestMessage?: string;
  readonly responseMessage?: string;
  readonly sourceWsdl?: string;
  readonly deprecated?: boolean;
  readonly sourceWsdlSha256?: string;
}

export interface RawInvokeOptions {
  readonly signal?: AbortSignal;
}

export type RawEndpointResolver = URL | ((metadata: RawOperationMetadata) => URL);

export class RawSoapClient {
  constructor(
    private readonly transport: BunFetchTransport,
    private readonly endpoint: RawEndpointResolver,
  ) {}

  endpointFor(metadata: RawOperationMetadata): URL {
    return this.endpoint instanceof URL ? this.endpoint : this.endpoint(metadata);
  }

  async invokeXml(metadata: RawOperationMetadata, bodyXml: string, options: RawInvokeOptions = {}): Promise<string> {
    const envelope = createSoapEnvelope({ version: metadata.soapVersion, bodyXml });
    const headers = new Headers({ "Content-Type": soapContentType(metadata.soapVersion, metadata.soapAction) });
    if (metadata.soapVersion === "1.1" && metadata.soapAction) {
      headers.set("SOAPAction", metadata.soapAction);
    }
    const request = {
      url: this.endpointFor(metadata),
      headers,
      body: envelope,
      ...(options.signal ? { signal: options.signal } : {}),
    };
    const response = await this.transport.request(request);
    const text = await response.text();
    throwIfSoapFault(text);
    return text;
  }

  async invokeGeneratedXml(operation: string, bodyXml: string, options: RawInvokeOptions = {}): Promise<string> {
    const metadata = GENERATED_OPERATIONS.find((item) => item.operation === operation);
    if (!metadata) {
      throw new IsdsUnsupportedOperationError("Unknown generated ISDS operation.", { operation });
    }
    return this.invokeXml(metadata, bodyXml, options);
  }
}
