# zeta.js

Lightweight Bun + TypeScript API client for Zeta!

---

```ts
import { ZetaClient } from "./src/index.ts";

const client = new ZetaClient({
  token: Bun.env.TOKEN,
  refreshToken: Bun.env.REFRESH_TOKEN,
  deviceId: Bun.env.DEVICE_ID,
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

## Scripts

```bash
bun test
bun run typecheck
```
