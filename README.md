# @evex/zeta

TypeScript client for the saved Zeta **3.51.94** Android and Web contracts. The
runtime uses Web standard APIs and works in Bun, Node.js, Deno and browsers.

```ts
import { ZetaClient } from "@evex/zeta";

const client = new ZetaClient({
  token: "<access-token>",
  refreshToken: "<refresh-token>",
  deviceId: "<device-id>",
  userLanguage: "JAPANESE",
  onTokenUpdate(tokens) {
    // Persist accessToken and refreshToken together.
  },
});

const room = await client.api.getRoom({ path: { roomId: "room-id" } });
const stream = await client.api.chat({
  path: { roomId: "room-id" },
  body: { type: "TEXT", text: "Hello" },
});
for await (const { data } of stream) {
  if (data.event === "IN_PROGRESS") {
    for (const content of data.chunkMessage.contents ?? []) {
      if (content.type === "TEXT") console.log(content.text);
    }
  }
}
```

## Current contracts

`client.api` provides **411 named methods**: all 408 static service contracts in
the saved Android client and three additional Web Brandpay contracts. Method
names follow the saved descriptor exports with the trailing `Api` removed.
This includes plugins, creator feed and comments, Frame4cut, CodaPay, vouchers,
discovery, image editing, v2 search and likes, bookmarks and seasonal features.

Every method handles the HTTP method, path and multipart setting. Path parameters
are required by name. GET bodies are rejected by TypeScript; multipart methods
require `FormData`. Query values use comma-separated arrays and dotted objects.
Options include `signal`, headers and authentication controls.

```ts
await client.api.listPlugin();
await client.api.searchPlotV2({ query: { keyword: "school" } });

const form = new FormData();
form.set("image", new Blob(["..."], { type: "image/png" }));
await client.api.extractTagsFromImage({ body: form });
```

The underlying definitions and their source locations are exported as
`snapshotEndpoints`. Dynamic URLs, debug endpoints and third-party services are
outside this static contract catalog. Token issuance and refresh are available
through `client.auth`, `startAnonymousSession()` and `refreshTokens()`.

## Types and evidence

`SnapshotDto<"RoomModelSettingApiDto">` and `SnapshotDtoMap` expose the saved
DTO graph. There are 1,106 Android named constructor shapes, 476 matched Web DTOs,
two additional Web response aliases, and 160 exported enum objects and types.
Chat requests, message contents, known stream events and model settings also
have dedicated public types, including `ChatPluginRequest`, `InfoBoxContent`,
`CyoaStreamData`, `PluginSelection` and `RoomModelSetting`.

The distributed JavaScript erased primitive types, requiredness and some fields.
Those fields remain `unknown` and optional rather than `any`. Decorators alone
do not distinguish an object from an array, so unconfirmed nested values and
response roots use `SourceValue<T> = T | T[] | null`. Known consuming code is used
to give common endpoints more specific response types. Narrow uncertain values
before using them; the SDK does not perform runtime schema validation.

In particular, the exact CYOA input fields, model-setting update fields, plugin
stream event name and current plot-generation job payload are not recoverable
from these saved artifacts. Unrecovered JSON inputs accept JSON objects. The
SDK does not invent `optionId`, sampling parameters, or a completed Plot response
for those contracts.

Dates stay ISO strings in JSON responses. Known stream events form a discriminated
union. Unknown future events are still passed through at runtime; callers that
need an open event shape can use `streamMessage<UnknownChatStreamEvent>()` or
`baseClient.stream<UnknownChatStreamEvent>()`.

## Resource interface and migration

`client.talk`, `plots`, `profile`, `search`, `coin`, `pass` and other existing
resource helpers remain available. Current behavior includes:

- Room lists use `/v2/rooms`.
- Search uses `/v2/plots/search`. `searchPlots()` retains raw `items` and exposes
  ZETA results as `plots`; LABS entries remain in `items`. `searchPlotsPage()`
  returns the unmodified v2 page.
- Likes use v2. Liked plot lists retain `items` and expose `plots` for resource callers.
- Push tokens use PUT, signup checks use POST, and keyword tests use POST.
- NICE initiation and validation are separate methods; validation uses the
  `request_id` and `web_transaction_id` query fields.
- Creator Assistant uses `generate-situations` and `quota`; job submission
  returns a job DTO rather than a Plot.
- Image upload/crop helpers use their actual multipart contracts. Methods named
  `createCharacterImage` and `createPlotImage` are deprecated list aliases; use
  `listCharacterImagesForCreator` and `listPlotImagesForCreator`.
- The old `uploadOriginal*` aliases now use the observed multipart update
  endpoints. `getOriginal*` retrieves the original image.
- `streamExampleChat()` sends POST; the old GET helper is retained as legacy.
- Sampling settings are no longer presented as the room model-setting response.

Helpers whose contracts are absent from the saved clients are marked deprecated
and retained for older callers. Their continued availability is not evidence
that the deployed server accepts them. Use `client.api` for the saved current
contracts. This update has no live backend compatibility claim.

The default identity is Android/app 3.51.94. Explicit iOS, device and version
options remain supported. `webClientOptions()` chooses `web` or `pc_web` from the
browser user agent; server runtimes default to `pc_web`.

Resource helpers still support the existing daily reward flow:

```ts
const summary = await client.coin.claimDailyRewards();
console.log(summary.claimed, summary.balance, summary.leftAttemptsAfter);
```

The CLI port of `zeta_dailyclaim.py` is available from the package directory:

```bash
ZETA_TOKEN='<access-token>' bun run dailyclaim
```

## Typed feed uploads

```ts
await client.feed.create({
  blocks: [{ type: "TEXT", text: "Hello" }],
  commentEnabled: true,
});
```

`FeedPostBlock` covers text, plot links, images and polls.
`createFeedPostForm()` encodes blocks and comment settings as the saved client
does and accepts attachments by file key. The native feed methods also accept
`FormData` directly.

## Authentication and streams

JWTs are refreshed 30 seconds before expiration when refresh credentials are
available. Opaque tokens and clients without refresh credentials keep the
reactive 401 flow. Updates are shared by matching credentials. A late 401 for an
old token reuses an already refreshed token. A valid token remains usable after
a transient proactive refresh failure.

The SDK policy defaults to three refresh attempts, exponential delays starting
at one second and a five-second failure cooldown. Network failures, 408, 429 and
5xx are retryable; ordinary mutations are not retried for those failures. The
policy can be configured with `refreshPolicy`. Credential failures are not
retried, and token persistence callback errors propagate.

SSE supports JSON and text, ignores heartbeats and cancels the underlying reader
when iteration ends early. Aborting one caller waiting on a shared refresh does
not cancel other callers. Resource stream methods accept a final options argument
with `signal`.

## Runtime requirements

- Node.js 18+.
- Bun 1+.
- Deno 1.39+.
- Browser and edge runtimes with Web Fetch API support.
- A custom compatible `fetch` can be supplied with `new ZetaClient({ fetch })`;
  the other Web standard APIs must also be available.

JSR creates provenance automatically for GitHub Actions publishes that use OIDC.

## Validation and regeneration

From the workspace root:

```bash
bun test
bun run typecheck
bun run check:snapshot
```

Public type tests cover required paths, message discriminators, multipart inputs
and unresolved fields. Runtime tests exercise Bun, Node and Deno. The contract
tests compare every named method against an independently extracted AST inventory.
All tests use local fixtures and mock transports.

When the analysis directory is available, from this package:

```bash
bun scripts/extract-snapshot-dtos.ts
bun scripts/sync-snapshot.ts
bun scripts/generate-snapshot-types.ts
```

Committed fixtures make the generated-code check work in the API repository
without the APK or Web mirror. Generated files contain provenance and should be
updated through these scripts.
