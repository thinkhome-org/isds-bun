# ADR 0001: Bun-only runtime

Status: accepted

The SDK targets Bun only. Bun native APIs are preferred for runtime execution,
package management, tests, HTTP, TLS, files, streams, TOML, SQLite, and builds.

Node compatibility is a non-goal until a separate ADR supersedes this decision.
