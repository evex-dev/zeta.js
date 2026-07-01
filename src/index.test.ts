import { describe, expect, test } from "bun:test";
import { BaseClient } from "./core/client.ts";
import { createWebAnonymousClient, createZetaClient, LorebookResource, PlotResource, Talk, ZetaClient } from "./index.ts";

describe("ZetaClient", () => {
  test("exposes object-oriented resource APIs", async () => {
    const calls: string[] = [];
    const client = new ZetaClient({
      baseUrl: "https://example.test",
      fetch: async (url) => {
        const requestUrl = String(url);
        calls.push(requestUrl);
        return new Response(JSON.stringify(bodyFor(requestUrl)), {
          headers: { "Content-Type": "application/json" },
        });
      },
    });

    const me = await client.profile.me();
    const talk = await client.talk.create({ plotId: "plot-1" });
    await talk.delete();
    const plot = await client.plots.create({ title: "Plot" });
    const lorebook = await client.lorebooks.create({ title: "Lorebook" });

    expect(client.baseClient).toBeInstanceOf(BaseClient);
    expect(client.baseClient.talk.sendTextMessage).toBeFunction();
    expect((client.talk as { sendTextMessage?: unknown }).sendTextMessage).toBeUndefined();
    expect(me.id).toBe("me");
    expect(talk).toBeInstanceOf(Talk);
    expect(talk.id).toBe("room-1");
    expect(plot).toBeInstanceOf(PlotResource);
    expect(plot.id).toBe("plot-1");
    expect(lorebook).toBeInstanceOf(LorebookResource);
    expect(lorebook.id).toBe("lorebook-1");
    expect(calls).toEqual([
      "https://example.test/v1/users/me",
      "https://example.test/v1/rooms",
      "https://example.test/v1/rooms/room-1",
      "https://example.test/v1/plots",
      "https://example.test/v1/lorebooks",
    ]);
  });

  test("keeps createZetaClient as a compatibility constructor", () => {
    expect(createZetaClient()).toBeInstanceOf(ZetaClient);
  });

  test("creates a web anonymous client", async () => {
    const bodies: unknown[] = [];
    const client = await createWebAnonymousClient({
      baseUrl: "https://example.test",
      deviceId: "device",
      fetch: async (url, init) => {
        expect(String(url)).toBe("https://example.test/v1/auth/tokens");
        const headers = new Headers(init?.headers);
        expect(headers.get("X-Client-Type")).toBe("web");
        expect(headers.get("X-Device-Type")).toBe("pc_web");
        bodies.push(JSON.parse(String(init?.body)));
        return new Response(JSON.stringify({ accessToken: "access", refreshToken: "refresh" }), {
          headers: { "Content-Type": "application/json" },
        });
      },
    });

    expect(client).toBeInstanceOf(ZetaClient);
    expect(client.token).toBe("access");
    expect(client.refreshToken).toBe("refresh");
    expect(bodies).toEqual([{ type: "anonymous", deviceId: "device" }]);
  });
});

function bodyFor(url: string): unknown {
  if (url.endsWith("/v1/users/me")) {
    return { id: "me" };
  }
  if (url.endsWith("/v1/rooms")) {
    return { id: "room-1" };
  }
  if (url.endsWith("/v1/plots")) {
    return { id: "plot-1" };
  }
  if (url.endsWith("/v1/lorebooks")) {
    return { id: "lorebook-1" };
  }
  return {};
}
