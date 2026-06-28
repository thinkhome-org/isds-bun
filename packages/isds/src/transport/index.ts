// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

import type { IsdsAuthenticationAdapter } from "../auth/index.ts";
import { IsdsHttpError, IsdsTimeoutError, IsdsTransportError } from "../errors/index.ts";

export interface IsdsTlsOptions {
  readonly key?: string | ArrayBufferView | Bun.BunFile;
  readonly cert?: string | ArrayBufferView | Bun.BunFile;
  readonly ca?: string | ArrayBufferView | Bun.BunFile;
}

export interface IsdsTransportOptions {
  readonly authentication?: IsdsAuthenticationAdapter;
  readonly timeoutMs?: number;
  readonly tls?: IsdsTlsOptions;
}

export interface IsdsTransportRequest {
  readonly url: URL;
  readonly method?: "GET" | "POST";
  readonly headers?: HeadersInit;
  readonly body?: BodyInit;
  readonly signal?: AbortSignal;
}

export class BunFetchTransport {
  constructor(private readonly options: IsdsTransportOptions = {}) {}

  async request(request: IsdsTransportRequest): Promise<Response> {
    const headers = new Headers(request.headers);
    const controller = new AbortController();
    const timeout = this.options.timeoutMs
      ? setTimeout(() => controller.abort("timeout"), this.options.timeoutMs)
      : undefined;

    request.signal?.addEventListener("abort", () => controller.abort(request.signal?.reason), { once: true });

    try {
      await this.options.authentication?.decorateRequest({ headers });
      const init: Record<string, unknown> = {
        method: request.method ?? "POST",
        headers,
        signal: controller.signal,
      };
      if (request.body !== undefined) init.body = request.body;
      if (this.options.tls !== undefined) init.tls = this.options.tls;
      const response = await fetch(request.url, init as RequestInit);

      await this.options.authentication?.handleResponse({ response });
      if (!response.ok) {
        throw new IsdsHttpError("ISDS HTTP request failed.", { status: response.status, url: request.url.toString() });
      }
      return response;
    } catch (error) {
      if (controller.signal.aborted) {
        throw new IsdsTimeoutError("ISDS request timed out or was aborted.", { url: request.url.toString() }, error);
      }
      if (error instanceof IsdsHttpError) throw error;
      throw new IsdsTransportError("ISDS transport request failed.", { url: request.url.toString() }, error);
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }
}
