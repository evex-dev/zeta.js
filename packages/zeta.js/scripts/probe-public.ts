import { createZetaClient, ApiError, type ApiResult, type UserLanguage, type BaseClient } from "../index.ts";

const client = createZetaClient({
  userLanguage: parseLanguage(Bun.env.USER_LANGUAGE),
  defaultHeaders: {
    "X-Client-Type": Bun.env.CLIENT_TYPE ?? "app",
    "X-Device-Type": Bun.env.DEVICE_TYPE ?? "android",
    "X-Client-Version": Bun.env.CLIENT_VERSION ?? "3.39.14",
    "X-Client-Native-Version": Bun.env.CLIENT_NATIVE_VERSION ?? "3.39.14",
    ...(Bun.env.DEVICE_ID ? { "X-Sticky": Bun.env.DEVICE_ID } : {}),
  },
});

type Probe = {
  name: string;
  run: (client: BaseClient) => Promise<ApiResult<unknown>>;
};

const probes: Probe[] = [
  { name: "GET /v1/feature-flags/web-purchase", run: (c) => c.featureFlags.getFeatureFlag("web-purchase") },
  { name: "GET /v1/feature-flags/genre-ranking", run: (c) => c.featureFlags.getFeatureFlag("genre-ranking") },
  { name: "GET /v1/feature-flags/ranking-tab", run: (c) => c.featureFlags.getFeatureFlag("ranking-tab") },
  { name: "GET /v1/feature-flags/plot-unlimited", run: (c) => c.featureFlags.getFeatureFlag("plot-unlimited") },
  { name: "GET /v1/infinite-plots", run: (c) => c.home.getInfinitePlots({ limit: 3 }) },
  { name: "GET /v1/banners", run: (c) => c.home.getBanners() },
  { name: "GET /v1/support-announcements", run: (c) => c.announcements.listSupportAnnouncements({ limit: 3 }) },
  { name: "GET /v1/plots/:plotId", run: (c) => c.plots.getPlot(Bun.env.PROBE_PLOT_ID ?? "ecafdb15-e650-4faf-a8fe-dc924711a4d7") },
  { name: "GET /v1/plots/search", run: (c) => c.search.searchPlots({ keyword: "romance", limit: 3 }) },
  { name: "GET /v1/plots/search/autocomplete", run: (c) => c.search.autocompletePlots({ keyword: "rom" }) },
  { name: "GET /v1/plots/ranking", run: (c) => c.ranking.getPlotRanking({ type: "REALTIME", limit: 3 }) },
  { name: "GET /v1/genres/ranking", run: (c) => c.ranking.getGenresRanking() },
  { name: "GET /v1/hashtag-topics", run: (c) => c.search.listHashtagTopics({ limit: 3 }) },
  { name: "GET /v1/hashtag-topics/romance/plots", run: (c) => c.ranking.getHashtagTopicPlots("romance", { limit: 3 }) },
  { name: "GET /v1/lorebooks/search", run: (c) => c.lorebooks.searchLorebooks({ keyword: "magic", limit: 3 }) },
  { name: "GET /v1/lorebooks/discovery/popular", run: (c) => c.lorebooks.getPopularLorebooks({ limit: 3 }) },
  { name: "GET /v1/usernames/awesome", run: (c) => c.profile.getAwesomeUsername() },
];

for (const probe of probes) {
  const started = performance.now();
  try {
    const result = await probe.run(client.baseClient);
    console.log(JSON.stringify({
      ok: true,
      name: probe.name,
      status: result.response.status,
      ms: Math.round(performance.now() - started),
      shape: describeShape(result.data),
      sample: summarize(result.data),
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

  if (Array.isArray(data)) {
    return data.slice(0, 1).map(summarize);
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

function parseLanguage(value?: string): UserLanguage | undefined {
  return value === "KOREAN" || value === "JAPANESE" || value === "ENGLISH" ? value : undefined;
}
