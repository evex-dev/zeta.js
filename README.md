# @evex/zeta

TypeScript API client for Zeta. The library uses Web standard APIs such as
`fetch`, `Headers`, `FormData`, and `ReadableStream`, so it can run on modern
JavaScript runtimes without depending on Bun.

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

- A runtime with Web Fetch API support.
- For older runtimes, pass a compatible `fetch` implementation with
  `new ZetaClient({ fetch })`.

## Scripts

```bash
bun test
bun run typecheck
```
