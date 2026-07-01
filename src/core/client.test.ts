import { describe, expect, test } from "bun:test";
import { BaseClient, interpolatePath, serializeQuery, webClientOptions } from "./client.ts";
import { ApiError } from "./types.ts";

describe("path and query helpers", () => {
  test("interpolates and escapes path params", () => {
    expect(interpolatePath("/v1/plots/:plotId/messages/:messageId", {
      plotId: "plot 1",
      messageId: "m/2",
    })).toBe("/v1/plots/plot%201/messages/m%2F2");
  });

  test("throws on missing path params", () => {
    expect(() => interpolatePath("/v1/plots/:plotId")).toThrow(ApiError);
  });

  test("serializes arrays as comma and nested objects as dotted query", () => {
    expect(serializeQuery({
      ids: ["a", "b"],
      orderBy: { property: "LAST_MESSAGE_TIME", direction: "DESC" },
      empty: null,
      skip: undefined,
    })).toBe("ids=a%2Cb&orderBy.property=LAST_MESSAGE_TIME&orderBy.direction=DESC&empty=");
  });
});

describe("BaseClient request", () => {
  test("injects authorization and JSON body", async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const client = new BaseClient({
      baseUrl: "https://example.test",
      token: "access",
      fetch: async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} });
        return jsonResponse({ ok: true }, { "x-request-id": "req-1" });
      },
    });

    const result = await client.post("/v1/things/:id", { value: 1 }, { path: { id: "abc" } });

    expect(result.data).toEqual({ ok: true });
    expect(result.requestId).toBe("req-1");
    expect(calls[0]?.url).toBe("https://example.test/v1/things/abc");
    expect(new Headers(calls[0]?.init.headers).get("Authorization")).toBe("Bearer access");
    expect(new Headers(calls[0]?.init.headers).get("Content-Type")).toBe("application/json");
    expect(calls[0]?.init.body).toBe(JSON.stringify({ value: 1 }));
  });

  test("converts plain multipart bodies to FormData", async () => {
    let body: BodyInit | null | undefined;
    let contentType: string | null = null;
    const client = new BaseClient({
      baseUrl: "https://example.test",
      fetch: async (_url, init) => {
        body = init?.body;
        contentType = new Headers(init?.headers).get("Content-Type");
        return jsonResponse({ ok: true });
      },
    });

    await client.put("/upload", { name: "cover", tags: ["a", "b"], meta: { x: 1 } }, { multipart: true });

    expect(body).toBeInstanceOf(FormData);
    expect(contentType).toBeNull();
    const form = body as FormData;
    expect(form.get("name")).toBe("cover");
    expect(form.getAll("tags")).toEqual(["a", "b"]);
    expect(form.get("meta")).toBe(JSON.stringify({ x: 1 }));
  });

  test("refreshes once and retries on AuthExpired", async () => {
    const urls: string[] = [];
    const updates: unknown[] = [];
    const client = new BaseClient({
      baseUrl: "https://example.test",
      token: "old",
      refreshToken: "refresh",
      deviceId: "device",
      onTokenUpdate: (tokens) => {
        updates.push(tokens);
      },
      fetch: async (url, init) => {
        urls.push(String(url));
        if (String(url).endsWith("/v1/protected") && new Headers(init?.headers).get("Authorization") === "Bearer old") {
          return jsonResponse({ code: "AuthExpired", message: "expired" }, {}, 401);
        }
        if (String(url).endsWith("/v1/auth/tokens")) {
          expect(init?.body).toBe(JSON.stringify({ type: "refresh", refreshToken: "refresh", deviceId: "device" }));
          return jsonResponse({ accessToken: "new", refreshToken: "refresh-2" });
        }
        return jsonResponse({ ok: true, auth: new Headers(init?.headers).get("Authorization") });
      },
    });

    const result = await client.get<{ ok: boolean; auth: string }>("/v1/protected");

    expect(result.data).toEqual({ ok: true, auth: "Bearer new" });
    expect(client.token).toBe("new");
    expect(client.refreshToken).toBe("refresh-2");
    expect(updates).toEqual([{ accessToken: "new", token: "new", refreshToken: "refresh-2" }]);
    expect(urls).toEqual([
      "https://example.test/v1/protected",
      "https://example.test/v1/auth/tokens",
      "https://example.test/v1/protected",
    ]);
  });

  test("refreshes on AUTH_EXPIRED code", async () => {
    const client = new BaseClient({
      baseUrl: "https://example.test",
      token: "old",
      refreshToken: "refresh",
      fetch: async (url, init) => {
        if (String(url).endsWith("/v1/auth/tokens")) {
          return jsonResponse({ accessToken: "new", refreshToken: "refresh" });
        }
        if (new Headers(init?.headers).get("Authorization") === "Bearer old") {
          return jsonResponse({ code: "AUTH_EXPIRED" }, {}, 401);
        }
        return jsonResponse({ ok: true, auth: new Headers(init?.headers).get("Authorization") });
      },
    });

    await expect(client.get("/v1/protected")).resolves.toMatchObject({
      data: { ok: true, auth: "Bearer new" },
    });
  });

  test("manual refresh returns fresh tokens and updates the client", async () => {
    const updates: unknown[] = [];
    const client = new BaseClient({
      baseUrl: "https://example.test",
      token: "old",
      refreshToken: "refresh",
      deviceId: "device",
      onTokenUpdate: (tokens) => {
        updates.push(tokens);
      },
      fetch: async (url, init) => {
        expect(String(url)).toBe("https://example.test/v1/auth/tokens");
        expect(init?.body).toBe(JSON.stringify({ type: "refresh", refreshToken: "refresh", deviceId: "device" }));
        return jsonResponse({ accessToken: "new", refreshToken: "refresh-2" });
      },
    });

    const tokens = await client.refreshTokens();

    expect(tokens).toEqual({ accessToken: "new", token: "new", refreshToken: "refresh-2" });
    expect(client.token).toBe("new");
    expect(client.refreshToken).toBe("refresh-2");
    expect(updates).toEqual([tokens]);
  });

  test("starts anonymous session and stores returned tokens", async () => {
    const updates: unknown[] = [];
    const client = new BaseClient({
      baseUrl: "https://example.test",
      deviceId: "device",
      onTokenUpdate: (tokens) => {
        updates.push(tokens);
      },
      fetch: async (url, init) => {
        expect(String(url)).toBe("https://example.test/v1/auth/tokens");
        expect(init?.body).toBe(JSON.stringify({ type: "anonymous", deviceId: "device" }));
        expect(new Headers(init?.headers).get("Authorization")).toBeNull();
        expect(new Headers(init?.headers).get("X-Sticky")).toBe("device");
        return jsonResponse({ accessToken: "anon-access", refreshToken: "anon-refresh" });
      },
    });

    const tokens = await client.startAnonymousSession();

    expect(tokens).toEqual({ accessToken: "anon-access", token: "anon-access", refreshToken: "anon-refresh" });
    expect(client.token).toBe("anon-access");
    expect(client.refreshToken).toBe("anon-refresh");
    expect(updates).toEqual([tokens]);
  });

  test("generates a device id for anonymous sessions without one", async () => {
    let body: unknown;
    const seen: { sticky?: string | null } = {};
    const client = new BaseClient({
      baseUrl: "https://example.test",
      fetch: async (_url, init) => {
        body = JSON.parse(String(init?.body));
        seen.sticky = new Headers(init?.headers).get("X-Sticky");
        return jsonResponse({ accessToken: "anon-access", refreshToken: "anon-refresh" });
      },
    });

    await client.startAnonymousSession();

    expect(body).toMatchObject({ type: "anonymous" });
    expect(typeof (body as { deviceId?: unknown }).deviceId).toBe("string");
    expect((body as { deviceId: string }).deviceId.length).toBeGreaterThan(0);
    expect(seen.sticky).toBe((body as { deviceId: string }).deviceId);
    expect(client.session.deviceId).toBe((body as { deviceId: string }).deviceId);
  });

  test("web client options match the web anonymous client headers", async () => {
    const client = new BaseClient({
      ...webClientOptions({ baseUrl: "https://example.test", deviceId: "device" }),
      fetch: async (_url, init) => {
        const headers = new Headers(init?.headers);
        expect(headers.get("X-Client-Type")).toBe("web");
        expect(headers.get("X-Device-Type")).toBe("pc_web");
        expect(headers.get("X-Client-Version")).toBe("3.39.17");
        expect(headers.get("X-Client-Native-Version")).toBe("3.39.17");
        return jsonResponse({ accessToken: "anon-access", refreshToken: "anon-refresh" });
      },
    });

    await client.startAnonymousSession();
  });

  test("uses single-flight refresh for concurrent 401 responses", async () => {
    let refreshCalls = 0;
    const client = new BaseClient({
      baseUrl: "https://example.test",
      token: "old",
      refreshToken: "refresh",
      fetch: async (url, init) => {
        if (String(url).endsWith("/v1/auth/tokens")) {
          refreshCalls += 1;
          await Bun.sleep(10);
          return jsonResponse({ accessToken: "new", refreshToken: "refresh" });
        }
        if (new Headers(init?.headers).get("Authorization") === "Bearer old") {
          return jsonResponse({ code: "AuthExpired" }, {}, 401);
        }
        return jsonResponse({ ok: true });
      },
    });

    await Promise.all([
      client.get("/v1/a"),
      client.get("/v1/b"),
      client.get("/v1/c"),
    ]);

    expect(refreshCalls).toBe(1);
  });

  test("throws ApiError when refresh fails", async () => {
    const client = new BaseClient({
      baseUrl: "https://example.test",
      token: "old",
      refreshToken: "bad",
      fetch: async (url, init) => {
        if (String(url).endsWith("/v1/auth/tokens")) {
          return jsonResponse({ code: "AuthExpired", message: "refresh expired" }, {}, 401);
        }
        if (new Headers(init?.headers).get("Authorization") === "Bearer old") {
          return jsonResponse({ code: "AuthExpired" }, {}, 401);
        }
        return jsonResponse({ ok: true });
      },
    });

    await expect(client.get("/v1/protected")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      code: "AuthExpired",
    });
  });
});

function jsonResponse(data: unknown, headers: HeadersInit = {}, status = 200): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { status, headers: responseHeaders });
}
