import { expect, test } from "bun:test";
import { BaseClient } from "./client.ts";

const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { "Content-Type": "application/json" } });
const jwt = (expiresIn: number) => `header.${btoa(JSON.stringify({ exp: Date.now() / 1_000 + expiresIn })).replace(/=/g, "")}.signature`;
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}

test("REST and SSE share proactive refresh before transmitting an expiring JWT", async () => {
  const refreshStarted = deferred<void>();
  const refreshResult = deferred<Response>();
  let refreshes = 0;
  const headers: string[] = [];
  const client = new BaseClient({ token: jwt(10), refreshToken: "refresh", fetch: async (url, init) => {
    if (String(url).endsWith("/auth/tokens")) {
      refreshes++;
      refreshStarted.resolve();
      return refreshResult.promise;
    }
    headers.push(new Headers(init?.headers).get("Authorization")!);
    return String(url).endsWith("/stream") ? new Response('data: {"event":"CHAT_COMPLETE","replyMessage":{}}\n\n') : json({ ok: true });
  } });
  const rest = client.get("/v1/me");
  const stream = client.stream("/v1/chat/stream", { type: "TEXT", text: "hello" });
  await refreshStarted.promise;
  expect(headers).toEqual([]);
  refreshResult.resolve(json({ accessToken: "fresh", refreshToken: "rotated" }));
  await rest;
  const events = [];
  for await (const event of await stream) events.push(event.data);
  expect(refreshes).toBe(1);
  expect(headers).toEqual(["Bearer fresh", "Bearer fresh"]);
  expect(events).toEqual([{ event: "CHAT_COMPLETE", replyMessage: {} }]);
  expect(client.refreshToken).toBe("rotated");
});

test("retries transient refresh failures without replaying the original mutation", async () => {
  let refreshes = 0;
  let writes = 0;
  const client = new BaseClient({ token: jwt(5), refreshToken: "refresh", refreshPolicy: { baseDelayMs: 0 }, fetch: async (url) => {
    if (String(url).endsWith("/auth/tokens")) {
      refreshes++;
      if (refreshes === 1) throw new TypeError("offline");
      if (refreshes === 2) return json({ code: "InternalServerError" }, 503);
      return json({ accessToken: "fresh" });
    }
    writes++;
    return json({ written: true });
  } });
  await expect(client.post("/v1/posts", { text: "one" })).resolves.toMatchObject({ data: { written: true } });
  expect(refreshes).toBe(3);
  expect(writes).toBe(1);
});

test("does not retry an invalid refresh credential, and cools down subsequent refreshes", async () => {
  let refreshes = 0;
  const client = new BaseClient({ token: "old", refreshToken: "bad", fetch: async (url) => {
    if (String(url).endsWith("/auth/tokens")) refreshes++;
    return json({ code: "AUTH_EXPIRED" }, 401);
  } });
  await expect(client.get("/v1/a")).rejects.toMatchObject({ status: 401 });
  await expect(client.get("/v1/b")).rejects.toMatchObject({ status: 401 });
  expect(refreshes).toBe(1);
  expect(client.token).toBe("old");
});

test("keeps using a valid JWT on transient preflight failure without a refresh storm", async () => {
  let refreshes = 0;
  const client = new BaseClient({ token: jwt(20), refreshToken: "refresh", refreshPolicy: { maxAttempts: 1 }, fetch: async (url) => {
    if (String(url).endsWith("/auth/tokens")) { refreshes++; throw new TypeError("offline"); }
    return json({ ok: true });
  } });
  await client.get("/v1/a");
  await client.get("/v1/b");
  expect(refreshes).toBe(1);
});

test("a late 401 for an old token uses the refreshed token without rotating again", async () => {
  let refreshes = 0;
  const late = deferred<Response>();
  const client = new BaseClient({ token: "old", refreshToken: "refresh", fetch: async (url, init) => {
    if (String(url).endsWith("/auth/tokens")) { refreshes++; return json({ accessToken: "fresh" }); }
    if (new Headers(init?.headers).get("Authorization") === "Bearer old") {
      if (String(url).endsWith("/b")) return late.promise;
      return json({ code: "AUTH_EXPIRED" }, 401);
    }
    return json({ ok: true });
  } });
  const a = client.get("/v1/a");
  const b = client.get("/v1/b");
  await a;
  late.resolve(json({ code: "AUTH_EXPIRED" }, 401));
  await b;
  expect(refreshes).toBe(1);
});

test("aborting one waiting caller leaves the shared refresh available to others", async () => {
  const started = deferred<void>();
  const refresh = deferred<Response>();
  const controller = new AbortController();
  let refreshes = 0;
  const client = new BaseClient({ token: jwt(5), refreshToken: "refresh", fetch: async (url) => {
    if (String(url).endsWith("/auth/tokens")) { refreshes++; started.resolve(); return refresh.promise; }
    return json({ ok: true });
  } });
  const cancelled = client.get("/v1/a", { signal: controller.signal });
  const active = client.get("/v1/b");
  await started.promise;
  controller.abort(new DOMException("cancelled", "AbortError"));
  await expect(cancelled).rejects.toMatchObject({ name: "AbortError" });
  refresh.resolve(json({ accessToken: "fresh" }));
  await expect(active).resolves.toMatchObject({ data: { ok: true } });
  expect(refreshes).toBe(1);
});

test("manual refresh accepts supplied credentials and shares concurrent updates", async () => {
  let calls = 0;
  const client = new BaseClient({ fetch: async (_url, init) => {
    calls++;
    expect(JSON.parse(String(init?.body))).toEqual({ type: "refresh", refreshToken: "provided", deviceId: "device" });
    expect(new Headers(init?.headers).get("X-Sticky")).toBe("device");
    return json({ accessToken: "fresh", refreshToken: "rotated" });
  } });
  await Promise.all([client.refreshTokens("provided", "device"), client.refreshTokens("provided", "device")]);
  expect(calls).toBe(1);
  expect(client.token).toBe("fresh");
  expect(client.refreshToken).toBe("rotated");
});

test("manual refresh with different credentials is serialized rather than conflated", async () => {
  const first = deferred<Response>();
  const bodies: unknown[] = [];
  const client = new BaseClient({ fetch: async (_url, init) => {
    bodies.push(JSON.parse(String(init?.body)));
    return bodies.length === 1 ? first.promise : json({ accessToken: "second" });
  } });
  const a = client.refreshTokens("first-refresh", "first-device");
  const b = client.refreshTokens("second-refresh", "second-device");
  expect(bodies).toHaveLength(1);
  first.resolve(json({ accessToken: "first" }));
  const results = await Promise.all([a, b]);
  expect(results.map((result) => result.accessToken)).toEqual(["first", "second"]);
  expect(bodies).toEqual([
    { type: "refresh", refreshToken: "first-refresh", deviceId: "first-device" },
    { type: "refresh", refreshToken: "second-refresh", deviceId: "second-device" },
  ]);
  expect(client.session.deviceId).toBe("second-device");
  expect(client.refreshToken).toBe("second-refresh");
});

test("token persistence callback errors are not mistaken for transient network failures", async () => {
  const client = new BaseClient({ token: jwt(10), refreshToken: "refresh", onTokenUpdate() { throw new TypeError("persist failed"); }, fetch: async () => json({ accessToken: jwt(100) }) });
  await expect(client.get("/v1/a")).rejects.toThrow("persist failed");
});
