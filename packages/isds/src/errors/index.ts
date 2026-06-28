// SPDX-FileCopyrightText: 2026 ThinkHome s.r.o.
// SPDX-License-Identifier: MPL-2.0

export type SafeErrorDetails = Record<string, unknown>;

const SECRET_KEYS = /password|secret|token|cookie|authorization|private.?key|pfx/i;

export function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== "object") return value;

  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    out[key] = SECRET_KEYS.test(key) ? "[REDACTED]" : redact(item);
  }
  return out;
}

export class IsdsError extends Error {
  readonly code: string;
  readonly details: SafeErrorDetails;

  constructor(message: string, code: string, details: SafeErrorDetails = {}, cause?: unknown) {
    super(message, { cause });
    this.name = new.target.name;
    this.code = code;
    this.details = details;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: redact(this.details),
    };
  }
}

export class IsdsConfigurationError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_CONFIGURATION", details, cause);
  }
}

export class IsdsAuthenticationError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_AUTHENTICATION", details, cause);
  }
}

export class IsdsAuthorizationError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_AUTHORIZATION", details, cause);
  }
}

export class IsdsCapabilityError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_CAPABILITY", details, cause);
  }
}

export class IsdsTransportError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_TRANSPORT", details, cause);
  }
}

export class IsdsTimeoutError extends IsdsTransportError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, details, cause);
    this.name = "IsdsTimeoutError";
  }
}

export class IsdsTlsError extends IsdsTransportError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, details, cause);
    this.name = "IsdsTlsError";
  }
}

export class IsdsProxyError extends IsdsTransportError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, details, cause);
    this.name = "IsdsProxyError";
  }
}

export class IsdsHttpError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_HTTP", details, cause);
  }
}

export class IsdsSoapFaultError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_SOAP_FAULT", details, cause);
  }
}

export class IsdsStatusError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_STATUS", details, cause);
  }
}

export class IsdsSchemaError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_SCHEMA", details, cause);
  }
}

export class IsdsXmlError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_XML", details, cause);
  }
}

export class IsdsMtomError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_MTOM", details, cause);
  }
}

export class IsdsAttachmentError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_ATTACHMENT", details, cause);
  }
}

export class IsdsCryptoError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_CRYPTO", details, cause);
  }
}

export class IsdsCertificateError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_CERTIFICATE", details, cause);
  }
}

export class IsdsRevocationError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_REVOCATION", details, cause);
  }
}

export class IsdsStorageError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_STORAGE", details, cause);
  }
}

export class IsdsUnsupportedOperationError extends IsdsError {
  constructor(message: string, details?: SafeErrorDetails, cause?: unknown) {
    super(message, "ISDS_UNSUPPORTED_OPERATION", details, cause);
  }
}
