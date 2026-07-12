import { BaseClient, createZetaClient, createWebAnonymousClient, serializeQuery, ZetaClient } from "../index.ts";
import type { FetchLike } from "../index.ts";

export type RuntimeTestAdapter = {
  describe: (name: string, fn: () => void) => void;
  test: (name: string, fn: () => void | Promise<void>) => void;
};

export function registerRuntimeTests(adapter: RuntimeTestAdapter): void {
  const { describe, test } = adapter;

  describe("runtime compatibility", () => {
    test("runs the client through Web standard APIs", async () => {
      const fetchImpl: FetchLike = async (input, init) => {
        return jsonResponse({
          ok: true,
          method: init?.method ?? "GET",
          url: String(input),
          auth: new Headers(init?.headers).get("Authorization"),
          body: init?.body ? JSON.parse(String(init.body)) : undefined,
        }, { "x-request-id": "runtime-suite" });
      };

      const client = createZetaClient({
        baseUrl: "https://example.test",
        token: "token",
        deviceId: "device",
        fetch: fetchImpl,
      });

      assert(client instanceof ZetaClient, "expected ZetaClient instance");
      assert(client.baseClient instanceof BaseClient, "expected BaseClient instance");

      const result = await client.baseClient.post<{
        ok: boolean;
        method: string;
        url: string;
        auth: string | null;
        body: unknown;
      }>("/v1/runtime/:id", { value: 1 }, {
        path: { id: "smoke" },
        query: { runtime: "portable" },
      });

      assertDeepEqual(result.data, {
        ok: true,
        method: "POST",
        url: "https://example.test/v1/runtime/smoke?runtime=portable",
        auth: "Bearer token",
        body: { value: 1 },
      });
      assertEqual(result.requestId, "runtime-suite");
    });

    test("serializes paths and query params consistently", () => {
      assertEqual(serializeQuery({
        q: "hello world",
        tags: ["a", "b"],
        nested: { page: 1 },
        empty: null,
      }), "q=hello%20world&tags=a%2Cb&nested.page=1&empty=");
    });

    test("handles multipart bodies with FormData", async () => {
      let body: BodyInit | null | undefined;
      let contentType: string | null = null;
      const client = new BaseClient({
        baseUrl: "https://example.test",
        fetch: async (_input, init) => {
          body = init?.body;
          contentType = new Headers(init?.headers).get("Content-Type");
          return jsonResponse({ ok: true });
        },
      });

      await client.put("/upload", { name: "cover", tags: ["a", "b"], meta: { x: 1 } }, { multipart: true });

      assert(body instanceof FormData, "expected multipart body to be FormData");
      assertEqual(contentType, null);
      const form = body as FormData;
      assertEqual(form.get("name"), "cover");
      assertDeepEqual(form.getAll("tags"), ["a", "b"]);
      assertEqual(form.get("meta"), JSON.stringify({ x: 1 }));
    });

    test("refreshes auth and retries once", async () => {
      const urls: string[] = [];
      const client = new BaseClient({
        baseUrl: "https://example.test",
        token: "old",
        refreshToken: "refresh",
        deviceId: "device",
        fetch: async (input, init) => {
          const url = String(input);
          urls.push(url);
          const auth = new Headers(init?.headers).get("Authorization");
          if (url.endsWith("/v1/protected") && auth === "Bearer old") {
            return jsonResponse({ code: "AuthExpired" }, {}, 401);
          }
          if (url.endsWith("/v1/auth/tokens")) {
            assertDeepEqual(JSON.parse(String(init?.body)), {
              type: "refresh",
              refreshToken: "refresh",
              deviceId: "device",
            });
            return jsonResponse({ accessToken: "new", refreshToken: "refresh-2" });
          }
          return jsonResponse({ ok: true, auth });
        },
      });

      const result = await client.get<{ ok: boolean; auth: string }>("/v1/protected");

      assertDeepEqual(result.data, { ok: true, auth: "Bearer new" });
      assertEqual(client.token, "new");
      assertEqual(client.refreshToken, "refresh-2");
      assertDeepEqual(urls, [
        "https://example.test/v1/protected",
        "https://example.test/v1/auth/tokens",
        "https://example.test/v1/protected",
      ]);
    });

    test("creates web anonymous client with web headers", async () => {
      const bodies: unknown[] = [];
      const client = await createWebAnonymousClient({
        baseUrl: "https://example.test",
        deviceId: "device",
        fetch: async (input, init) => {
          assertEqual(String(input), "https://example.test/v1/auth/tokens");
          const headers = new Headers(init?.headers);
          assertEqual(headers.get("X-Client-Type"), "web");
          assertEqual(headers.get("X-Device-Type"), "pc_web");
          bodies.push(JSON.parse(String(init?.body)));
          return jsonResponse({ accessToken: "access", refreshToken: "refresh" });
        },
      });

      assert(client instanceof ZetaClient, "expected ZetaClient instance");
      assertEqual(client.token, "access");
      assertEqual(client.refreshToken, "refresh");
      assertDeepEqual(bodies, [{ type: "anonymous", deviceId: "device" }]);
    });
  });
}

function jsonResponse(data: unknown, headers: HeadersInit = {}, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual: unknown, expected: unknown): void {
  if (!Object.is(actual, expected)) {
    throw new Error(`Expected ${format(actual)} to equal ${format(expected)}`);
  }
}

function assertDeepEqual(actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${format(actual)} to deep equal ${format(expected)}`);
  }
}

function format(value: unknown): string {
  return typeof value === "string" ? JSON.stringify(value) : JSON.stringify(value, null, 2);
}
