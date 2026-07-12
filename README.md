# @evex/zeta

Runtime-agnostic TypeScript API client for Zeta. The library uses Web standard
APIs such as `fetch`, `Headers`, `Blob`, `FormData`, `ReadableStream`,
`TextDecoder`, and `crypto.randomUUID`, so it can run on modern JavaScript
runtimes without depending on Bun.

---

```ts
import { ZetaClient } from "@evex/zeta";

const client = new ZetaClient({
  token: "<access-token>",
  refreshToken: "<refresh-token>",
  deviceId: "<device-id>",
  userLanguage: "ENGLISH",
  onTokenUpdate(tokens) {
    // Persist tokens wherever your application stores secrets.
    console.log("refreshed", tokens.accessToken, tokens.refreshToken);
  },
});

const me = await client.profile.me();
const freshTokens = await client.refreshTokens();

const talk = await client.talk.create({ plotId: "plot-id" });
const stream = await talk.sendTextMessage("Hello");
for await (const event of stream) {
  console.log(event.data.event, event.data.chunkMessage?.contents);
}

await talk.delete();
```

## Runtime requirements

- Node.js 18+.
- Bun 1+.
- Deno 1.39+.
- Browser and edge runtimes with Web Fetch API support.
- For older runtimes, pass a compatible `fetch` implementation with
  `new ZetaClient({ fetch })`.

Published JSR releases should show provenance when they are published from the
GitHub Actions workflows in this repository. JSR creates provenance
automatically for GitHub Actions publishes that use OIDC.

## Scripts

```bash
bun test
bun run typecheck
```
