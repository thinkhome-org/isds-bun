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

Store profile credentials in the OS credential store through Bun:

```bash
printf '%s' 'username' | bun packages/isds/src/bin/isds.ts secret set --name company-production/username --value-stdin
printf '%s' 'password' | bun packages/isds/src/bin/isds.ts secret set --name company-production/password --value-stdin
bun packages/isds/src/bin/isds.ts profile secret-status --config isds.toml --profile company-production
```

Operation coverage is tracked in `docs/generated/wsdl-operation-coverage.md`.
