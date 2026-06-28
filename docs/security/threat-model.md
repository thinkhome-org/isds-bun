# Threat Model

Initial risks tracked from the master prompt:

- credential theft
- private-key theft
- malicious SOAP/XML
- malicious attachments
- tenant confusion in HSS/SaaS profiles
- wrong-environment sends
- endpoint substitution
- proxy interception
- log leakage
- temporary-file leakage
- stale schemas
- compromised dependency
- forged ZFO
- revoked certificates
- replay and retry behavior
- local cache leakage

Controls already present in the scaffold:

- explicit environment selection
- HTTPS requirement for custom endpoints unless explicitly disabled
- typed unsupported-operation failures
- secret redaction helpers
- DTD/entity rejection in XML safety checks
- no automatic operation retry implementation yet
