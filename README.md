# ISDS Bun SDK

Bun-native SDK, CLI, mock server, and OpenTUI foundation for ISDS.

This repository intentionally starts with schema inventory and strict runtime
guards. It does not invent ISDS operations before current WSDL/XSD artifacts are
ingested.

```bash
bun install
bun run schemas:fetch
bun run generate
bun test
```

```ts
import { createIsdsClient } from "@thinkhome-org/isds";

const client = createIsdsClient({
  environment: "public-test",
  authentication: {
    type: "password",
    username: "user",
    password: "secret",
  },
});
```

Operation coverage is tracked in `docs/generated/wsdl-operation-coverage.md`.
