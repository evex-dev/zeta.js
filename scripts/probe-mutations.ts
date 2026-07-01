import { createZetaClient, ApiError, type ApiResult, type BaseClient } from "../src/index.ts";

const token = Bun.env.TOKEN;
const refreshToken = Bun.env.REFRESH_TOKEN;

if (!token && !refreshToken) {
  throw new Error("Set TOKEN and REFRESH_TOKEN in api/.env before running mutation probes.");
}

const client = createZetaClient({
  token,
  refreshToken,
  deviceId: Bun.env.DEVICE_ID,
  userLanguage: parseLanguage(Bun.env.USER_LANGUAGE),
  defaultHeaders: {
    "X-Client-Type": Bun.env.CLIENT_TYPE ?? "app",
    "X-Device-Type": Bun.env.DEVICE_TYPE ?? "android",
    "X-Client-Version": Bun.env.CLIENT_VERSION ?? "3.39.14",
    "X-Client-Native-Version": Bun.env.CLIENT_NATIVE_VERSION ?? "3.39.14",
  },
  onTokenUpdate(tokens) {
    console.log("refresh succeeded", {
      accessToken: Boolean(tokens.accessToken),
      refreshToken: Boolean(tokens.refreshToken),
    });
  },
});

const samplePlotId = await resolveProbePlotId(client.baseClient);
const sampleCreatorId = Bun.env.PROBE_CREATOR_ID ?? "528e2128-eb3b-48c3-9b8f-2fb6d53985cd";

type MutationProbe = {
  name: string;
  run: (client: BaseClient) => Promise<unknown>;
};

const probes: MutationProbe[] = [
  {
    name: "PUT/DELETE /v1/plots/:plotId/likes restore",
    run: async (c) => {
      const before = await c.plots.getPlotLikes(samplePlotId);
      const wasLiked = Boolean((before.data as { isLiked?: boolean; liked?: boolean }).isLiked ?? (before.data as { liked?: boolean }).liked);

      await c.plots.likePlot(samplePlotId);
      const afterLike = await c.plots.getPlotLikes(samplePlotId);

      if (!wasLiked) {
        await c.plots.unlikePlot(samplePlotId);
      }

      return {
        before: wasLiked,
        afterLike: summarize(afterLike.data),
        restored: !wasLiked,
      };
    },
  },
  {
    name: "POST/DELETE /v1/creators/:creatorId/follow restore",
    run: async (c) => {
      const before = await c.creator.getFollowState(sampleCreatorId);
      const wasFollowing = readBoolean(before.data, ["follow", "following", "followed"]);

      await c.creator.follow(sampleCreatorId);
      const afterFollow = await c.creator.getFollowState(sampleCreatorId);

      if (!wasFollowing) {
        await c.creator.unfollow(sampleCreatorId);
      }

      return {
        before: wasFollowing,
        afterFollow: summarize(afterFollow.data),
        restored: !wasFollowing,
      };
    },
  },
  {
    name: "POST/DELETE /v1/plots/blocks restore",
    run: async (c) => {
      await c.plots.blockPlot({ plotId: samplePlotId });
      const afterBlock = await c.plots.listBlockedPlots({ limit: 3 });
      await c.plots.unblockPlot({ plotId: samplePlotId });
      return {
        afterBlock: summarize(afterBlock.data),
        restored: true,
      };
    },
  },
  {
    name: "POST/PUT/DELETE /v1/rooms lifecycle",
    run: async (c) => {
      let roomId: string | undefined;
      try {
        const created = await c.talk.createRoom({ plotId: samplePlotId });
        roomId = readId(created.data, ["id", "roomId"]);

        if (!roomId) {
          return { created: summarize(created.data), cleanup: "skipped: no room id" };
        }

        const pinned = await c.talk.pinRoom(roomId);
        const unpinned = await c.talk.unpinRoom(roomId);
        const updated = await c.talk.updateRoom(roomId, { title: "probe" });

        return {
          roomId,
          pinned: statusOf(pinned),
          unpinned: statusOf(unpinned),
          updated: summarize(updated.data),
        };
      } finally {
        if (roomId) {
          await c.talk.deleteRoom(roomId).catch((error) => {
            console.error(JSON.stringify({
              cleanupFailed: "DELETE /v1/rooms/:roomId",
              roomId,
              ...describeError(error),
            }));
          });
        }
      }
    },
  },
];

for (const probe of probes) {
  const started = performance.now();
  try {
    const result = await probe.run(client.baseClient);
    console.log(JSON.stringify({
      ok: true,
      name: probe.name,
      ms: Math.round(performance.now() - started),
      result: summarize(result),
    }));
  } catch (error) {
    console.log(JSON.stringify({
      ok: false,
      name: probe.name,
      ms: Math.round(performance.now() - started),
      ...describeError(error),
    }));
  }
}

function statusOf(result: ApiResult<unknown>): Record<string, unknown> {
  return {
    status: result.response.status,
    shape: describeShape(result.data),
  };
}

async function resolveProbePlotId(c: BaseClient): Promise<string> {
  if (Bun.env.PROBE_PLOT_ID) {
    return Bun.env.PROBE_PLOT_ID;
  }

  const feed = await c.home.getInfinitePlots({ limit: 1 });
  const first = feed.data.plots[0];
  if (first?.id) {
    return first.id;
  }

  const search = await c.search.searchPlots({ keyword: "romance", limit: 1 });
  const searchFirst = search.data.plots[0];
  if (searchFirst?.id) {
    return searchFirst.id;
  }

  throw new Error("Could not resolve PROBE_PLOT_ID from /v1/infinite-plots or /v1/plots/search.");
}

function readId(data: unknown, keys: string[]): string | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  for (const key of keys) {
    const value = (data as Record<string, unknown>)[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

function readBoolean(data: unknown, keys: string[]): boolean {
  if (!data || typeof data !== "object") {
    return false;
  }

  for (const key of keys) {
    const value = (data as Record<string, unknown>)[key];
    if (typeof value === "boolean") {
      return value;
    }
  }

  return false;
}

function describeShape(data: unknown): string {
  if (Array.isArray(data)) {
    return `array(${data.length})`;
  }

  if (data && typeof data === "object") {
    return `object(${Object.keys(data).slice(0, 10).join(",")})`;
  }

  return typeof data;
}

function summarize(data: unknown): unknown {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (data instanceof Response) {
    return { status: data.status };
  }

  if (Array.isArray(data)) {
    return `array(${data.length})`;
  }

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data).slice(0, 8)) {
    if (Array.isArray(value)) {
      out[key] = `array(${value.length})`;
    } else if (value && typeof value === "object") {
      out[key] = `object(${Object.keys(value).slice(0, 8).join(",")})`;
    } else {
      out[key] = value;
    }
  }
  return out;
}

function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
      shape: describeShape(error.data),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      errorName: error.name,
    };
  }

  return { message: String(error) };
}

function parseLanguage(value: string | undefined): "KOREAN" | "JAPANESE" | "ENGLISH" | undefined {
  if (value === "KOREAN" || value === "JAPANESE" || value === "ENGLISH") {
    return value;
  }
  return undefined;
}
