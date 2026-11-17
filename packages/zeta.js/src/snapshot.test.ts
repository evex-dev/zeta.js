import { expect, test } from "bun:test";
import { ZetaClient, snapshotEndpoints, type RequestOptions } from "../index.ts";

type Descriptor = { method: string; path: string; response?: string; source: { path: string; line: number } };
const fixture = await Bun.file(new URL("../scripts/fixtures/snapshot-3.51.94-dtos.json", import.meta.url)).json() as {
  androidDescriptors: Descriptor[]; webDescriptors: Descriptor[];
};
const key = (method: string, path: string) => `${method} ${path.replace(/:[A-Za-z0-9_]+/g, ":param").replace(/\/$/, "")}`;

test("every service contract from the independent source AST inventory has a named wrapper", () => {
  const source = [...fixture.androidDescriptors, ...fixture.webDescriptors].filter((d) => /^\/v\d+\//.test(d.path));
  const expected = new Set(source.map((d) => key(d.method, d.path)));
  const actual = new Set(Object.values(snapshotEndpoints).map((e) => key(e.method, e.path)));
  expect(actual).toEqual(expected);
  expect(actual.size).toBe(411);
  for (const endpoint of Object.values(snapshotEndpoints)) {
    const android = fixture.androidDescriptors.find((d) => key(d.method, d.path) === key(endpoint.method, endpoint.path));
    if (android) expect(endpoint.response).toBe(android.response ?? null);
  }
});

test("all named wrappers transmit escaped paths and preserve JSON or SSE responses", async () => {
  let wire: { url: string; init?: RequestInit } | undefined;
  let streaming = false;
  const payload = { event: "FUTURE_EVENT", untouched: { value: 42 } };
  const client = new ZetaClient({ baseUrl: "https://example.test", token: "access", fetch: async (url, init) => {
    wire = { url: String(url), init };
    return streaming ? new Response(`data: ${JSON.stringify(payload)}\n\n`) : new Response(JSON.stringify(payload));
  } });
  // This loop intentionally exercises the runtime factory; static consumer
  // constraints are verified separately in scripts/type-tests/contracts.ts.
  const api = client.api as unknown as Record<string, (options: RequestOptions) => Promise<unknown>>;
  for (const [name, endpoint] of Object.entries(snapshotEndpoints)) {
    streaming = endpoint.stream;
    const path = Object.fromEntries([...endpoint.path.matchAll(/:([A-Za-z0-9_]+)/g)].map((m) => [m[1]!, "a/b +"]));
    const form = new FormData();
    form.append("image", new Blob(["image"], { type: "image/png" }));
    const body = endpoint.multipart ? form : endpoint.method === "GET" ? undefined : { probe: "value" };
    const result = await api[name]!({ path, query: { filter: { language: "ja" } }, body });
    expect(wire!.url).toBe(`https://example.test${endpoint.path.replace(/:[A-Za-z0-9_]+/g, "a%2Fb%20%2B")}?filter.language=ja`);
    expect(wire!.init?.method).toBe(endpoint.method);
    expect(new Headers(wire!.init?.headers).get("Authorization")).toBe("Bearer access");
    if (endpoint.multipart) {
      expect(wire!.init?.body).toBe(form);
      expect(new Headers(wire!.init?.headers).get("Content-Type")).toBeNull();
    }
    if (endpoint.stream) {
      const values = [];
      for await (const event of result as AsyncGenerator<{ data: unknown }>) values.push(event.data);
      expect(values).toEqual([payload]);
    } else {
      expect((result as { data: unknown }).data).toEqual(payload);
    }
  }
});

test("existing convenience methods use the corrected service contracts", async () => {
  const seen: Array<{ method?: string; url: string; body: unknown; contentType: string | null }> = [];
  const client = new ZetaClient({ baseUrl: "https://example.test", fetch: async (url, init) => {
    seen.push({ method: init?.method, url: String(url), body: init?.body, contentType: new Headers(init?.headers).get("Content-Type") });
    return new Response(JSON.stringify({ items: [], rooms: [] }));
  } });
  await client.app.registerPushToken({ token: "push" });
  await client.baseClient.profile.checkUser({ externalToken: { issuer: "example" } });
  await client.app.requestNiceAdditionalAuth();
  await client.app.validateNiceAdditionalAuth({ request_id: "request", web_transaction_id: "transaction" });
  await client.search.testKeyword({ keyword: "test" });
  await client.app.generateSituation({ prompt: "scene" });
  await client.app.getCreatorAssistantQuotaUpdates();
  await client.baseClient.plots.listCharacterImagesForCreator("plot", "character");
  await client.baseClient.plots.listPlotImagesForCreator("plot");
  const form = new FormData();
  form.set("image", new Blob(["image"]));
  await client.baseClient.plots.extractProfileImageTags(form);
  await client.baseClient.plots.cropChatProfileImage("plot", "profile", form);
  await client.baseClient.plots.appendAboutImages("plot", form);
  await client.baseClient.plots.uploadOriginalCharacterImage("plot", "character", form);
  await client.baseClient.plots.uploadOriginalChatProfileImage("plot", "profile", form);
  await client.baseClient.plots.uploadOriginalPlotImage("plot", form);
  await client.talk.list();
  await client.search.searchPlots({ keyword: "scene" });
  await client.baseClient.plots.likePlot("plot");
  await client.baseClient.plots.unlikePlot("plot");
  await client.baseClient.plots.getPlotLikes("plot");
  expect(seen.map((c) => `${c.method} ${c.url.replace("https://example.test", "")}`)).toEqual([
    "PUT /v1/app-push/tokens", "POST /v1/users/check", "POST /v2/additional-auth/nice",
    "GET /v2/additional-auth/nice/validate?request_id=request&web_transaction_id=transaction",
    "POST /v1/keywords/test", "POST /v2/creator-assistant/generate-situations", "GET /v2/creator-assistant/quota",
    "GET /v2/plots/plot/characters/character/images/creator", "GET /v2/plots/plot/images/creator",
    "POST /v1/plots/profile-image/tool/extract-tags", "POST /v2/plots/plot/chat-profiles/profile/images/crop",
    "POST /v1/plots/plot/about-images", "PUT /v2/plots/plot/characters/character/images",
    "PUT /v2/plots/plot/chat-profiles/profile/images", "PUT /v2/plots/plot/images", "GET /v2/rooms",
    "GET /v2/plots/search?keyword=scene",
    "PUT /v2/plots/plot/likes", "DELETE /v2/plots/plot/likes", "GET /v2/plots/plot/likes/summary",
  ]);
  for (const request of seen.filter((c) => c.body instanceof FormData)) expect(request.contentType).toBeNull();
});

test("v2 search keeps LABS items while exposing ZETA plots to existing consumers", async () => {
  const items = [{ type: "LABS", plot: { id: "labs" } }, { type: "ZETA", plot: { id: "zeta" } }];
  const client = new ZetaClient({ fetch: async () => new Response(JSON.stringify({ items, nextCursor: "next" })) });
  const result = await client.search.searchPlots();
  expect(result.data.items).toEqual(items);
  expect(result.data.plots).toEqual([{ id: "zeta" }]);
  expect(result.data.nextCursor).toBe("next");
});

test("typed feed creation encodes blocks, flags and attachments as multipart", async () => {
  let body: FormData | undefined;
  const client = new ZetaClient({ fetch: async (_url, init) => {
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).has("Content-Type")).toBe(false);
    body = init?.body as FormData;
    return new Response("{}");
  } });
  const blocks = [{ type: "IMAGE", fileKey: "image-0" }, { type: "TEXT", text: "caption" }] as const;
  await client.feed.create({ blocks: [...blocks], commentEnabled: false, files: { "image-0": new Blob(["png"]) } });
  expect(body!.get("blocks")).toBe(JSON.stringify(blocks));
  expect(body!.get("commentEnabled")).toBe("false");
  expect(body!.get("image-0")).toBeInstanceOf(Blob);
});
