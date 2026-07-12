import { createZetaClient, ApiError, type ApiResult, type UserLanguage, type BaseClient } from "../index.ts";

const token = Bun.env.TOKEN;
const refreshToken = Bun.env.REFRESH_TOKEN;

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

type Probe = {
  name: string;
  group: string;
  run: (client: BaseClient) => Promise<ApiResult<unknown>>;
};

const samplePlotId = Bun.env.PROBE_PLOT_ID ?? "ecafdb15-e650-4faf-a8fe-dc924711a4d7";
const sampleUserId = Bun.env.PROBE_USER_ID ?? "528e2128-eb3b-48c3-9b8f-2fb6d53985cd";
const sampleUsername = Bun.env.PROBE_USERNAME ?? "LinearDate6895";
const sampleTopicId = Bun.env.PROBE_TOPIC_ID ?? "260528-zeta-labs-cbt-ko";
const sampleHashtagTopicId = Bun.env.PROBE_HASHTAG_TOPIC_ID ?? "romance";

const probes: Probe[] = [
  { group: "auth", name: "GET /v1/users/me", run: (c) => c.auth.getMe() },
  { group: "auth", name: "GET /v1/auth/connected-external-platforms", run: (c) => c.auth.getConnectedExternalPlatforms() },

  { group: "featureFlags", name: "GET /v1/feature-flags/web-purchase", run: (c) => c.featureFlags.getFeatureFlag("web-purchase") },
  { group: "featureFlags", name: "GET /v1/feature-flags/genre-ranking", run: (c) => c.featureFlags.getFeatureFlag("genre-ranking") },
  { group: "featureFlags", name: "GET /v1/feature-flags/ranking-tab", run: (c) => c.featureFlags.getFeatureFlag("ranking-tab") },
  { group: "featureFlags", name: "GET /v1/feature-flags/plot-unlimited", run: (c) => c.featureFlags.getFeatureFlag("plot-unlimited") },

  { group: "home", name: "GET /v1/infinite-plots", run: (c) => c.home.getInfinitePlots({ limit: 16 }) },
  { group: "home", name: "GET /v1/layouts/main", run: (c) => c.home.getHomeLayout() },
  { group: "home", name: "GET /v1/layout-sections/home", run: (c) => c.home.getHomeLayoutSections() },
  { group: "home", name: "GET /v1/banners", run: (c) => c.home.getBanners() },
  { group: "home", name: "GET /v1/popups", run: (c) => c.home.getPopups() },

  { group: "announcements", name: "GET /v1/announcements", run: (c) => c.announcements.listAnnouncements({ limit: 3 }) },
  { group: "announcements", name: "GET /v1/support-announcements", run: (c) => c.announcements.listSupportAnnouncements({ limit: 3 }) },
  { group: "announcements", name: "GET /v1/announcements/banner", run: (c) => c.announcements.getAnnouncementBanner() },

  { group: "plots", name: "GET /v1/plots", run: (c) => c.plots.listPlots({ limit: 3 }) },
  { group: "plots", name: "GET /v1/plots/:plotId", run: (c) => c.plots.getPlot(samplePlotId) },
  { group: "plots", name: "GET /v1/plots/:plotId/viewer", run: (c) => c.plots.getPlotViewer(samplePlotId) },
  { group: "plots", name: "GET /v1/plots/:plotId/creator", run: (c) => c.plots.getPlotCreator(samplePlotId) },
  { group: "plots", name: "GET /v1/plots/:plotId/similar-plots", run: (c) => c.plots.listSimilarPlots(samplePlotId, { limit: 3 }) },
  { group: "plots", name: "GET /v1/plots/random-recently-created", run: (c) => c.plots.getRandomRecentlyCreated({ limit: 3, refresh: true }) },
  { group: "plots", name: "GET /v1/plots/prerelease/recent", run: (c) => c.plots.getPrereleaseRecent({ limit: 3 }) },
  { group: "plots", name: "GET /v1/plots/check-name", run: (c) => c.plots.checkPlotName({ name: "probe" }) },
  { group: "plots", name: "GET /v1/plots/:plotId/likes", run: (c) => c.plots.getPlotLikes(samplePlotId) },
  { group: "plots", name: "GET /v1/plots/liked", run: (c) => c.plots.listLikedPlots({ limit: 3 }) },
  { group: "plots", name: "GET /v1/plots/liked/count", run: (c) => c.plots.getLikedPlotCount() },
  { group: "plots", name: "GET /v1/plots/blocks", run: (c) => c.plots.listBlockedPlots({ limit: 3 }) },
  { group: "plots", name: "GET /v1/plot-summaries/:plotId", run: (c) => c.plots.getPlotSummary(samplePlotId) },

  { group: "search", name: "GET /v1/plots/search", run: (c) => c.search.searchPlots({ keyword: "romance", limit: 3 }) },
  { group: "search", name: "GET /v1/plots/search/autocomplete", run: (c) => c.search.autocompletePlots({ keyword: "rom" }) },
  { group: "search", name: "GET /v1/plots/search/recommended-placeholder", run: (c) => c.search.getRecommendedPlaceholder() },
  { group: "search", name: "GET /v1/plots/search/keywords/recommended", run: (c) => c.search.getRecommendedKeywords() },
  { group: "search", name: "GET /v1/plots/search/related-keywords", run: (c) => c.search.getRelatedKeywords({ keyword: "romance" }) },
  { group: "search", name: "GET /v1/hashtag-topics", run: (c) => c.search.listHashtagTopics({ limit: 3 }) },

  { group: "ranking", name: "GET /v1/plots/ranking", run: (c) => c.ranking.getPlotRanking({ type: "REALTIME", limit: 3 }) },
  { group: "ranking", name: "GET /v1/genres/ranking", run: (c) => c.ranking.getGenresRanking() },
  { group: "ranking", name: "GET /v1/topics/:topicId/plot-rankings", run: (c) => c.ranking.getTopicPlotRankings(sampleTopicId, { limit: 3 }) },
  { group: "ranking", name: "GET /v1/hashtag-topics/:hashtagTopicId/plots", run: (c) => c.ranking.getHashtagTopicPlots(sampleHashtagTopicId, { limit: 3 }) },

  { group: "talk", name: "GET /v1/rooms", run: (c) => c.talk.listRooms({ limit: 3 }) },
  { group: "talk", name: "GET /v1/rooms/active-room-id", run: (c) => c.talk.getActiveRoomId({ plotId: samplePlotId }) },
  { group: "talk", name: "GET /v1/rooms/saved", run: (c) => c.talk.listSavedRooms({ plotId: samplePlotId, limit: 3 }) },
  { group: "talk", name: "GET /v1/recommended-messages/quota", run: (c) => c.get("/v1/recommended-messages/quota") },
  { group: "talk", name: "GET /v1/chat-message-report-categories", run: (c) => c.get("/v1/chat-message-report-categories") },

  { group: "lorebooks", name: "GET /v1/lorebooks", run: (c) => c.lorebooks.listLorebooks({ limit: 3 }) },
  { group: "lorebooks", name: "GET /v1/lorebooks/creator", run: (c) => c.lorebooks.listCreatorLorebooks({ limit: 3 }) },
  { group: "lorebooks", name: "GET /v1/lorebooks/check-title", run: (c) => c.lorebooks.checkTitle({ title: "probe" }) },
  { group: "lorebooks", name: "GET /v1/lorebooks/search", run: (c) => c.lorebooks.searchLorebooks({ keyword: "magic", limit: 3 }) },
  { group: "lorebooks", name: "GET /v1/lorebooks/discovery/recommend", run: (c) => c.lorebooks.getRecommendedLorebooks({ limit: 3 }) },
  { group: "lorebooks", name: "GET /v1/lorebooks/discovery/recent-play", run: (c) => c.lorebooks.getRecentPlayLorebooks({ limit: 3 }) },
  { group: "lorebooks", name: "GET /v1/lorebooks/discovery/popular", run: (c) => c.lorebooks.getPopularLorebooks({ limit: 3 }) },

  { group: "profile", name: "GET /v1/users/:userId", run: (c) => c.profile.getUser(sampleUserId) },
  { group: "profile", name: "GET /v1/users/get-id-by-username/:username", run: (c) => c.profile.getUserIdByUsername(sampleUsername) },
  { group: "profile", name: "GET /v1/usernames/:username", run: (c) => c.profile.getUsername(sampleUsername) },
  { group: "profile", name: "GET /v1/usernames/awesome", run: (c) => c.profile.getAwesomeUsername() },
  { group: "profile", name: "GET /v1/user-chat-profiles", run: (c) => c.profile.listChatProfiles({ limit: 3 }) },
  { group: "profile", name: "GET /v1/user-chat-profiles/selected", run: (c) => c.profile.getSelectedChatProfile({ plotId: samplePlotId }) },
  { group: "profile", name: "GET /v1/users/blocks", run: (c) => c.profile.listBlockedUsers({ limit: 3 }) },

  { group: "creator", name: "GET /v1/creators/:creatorId/follow", run: (c) => c.creator.getFollowState(String(sampleUserId)) },
  { group: "creator", name: "GET /v1/creators/:creatorId/followings", run: (c) => c.creator.listFollowings(String(sampleUserId), { limit: 3 }) },
  { group: "creator", name: "GET /v1/creators/:creatorId/followers", run: (c) => c.creator.listFollowers(String(sampleUserId), { limit: 3 }) },
  { group: "creator", name: "GET /v1/creators/me/followings/count", run: (c) => c.creator.getMyFollowingCount() },
  { group: "creator", name: "GET /v1/creators/me/stats", run: (c) => c.creator.getMyStats() },
  { group: "creator", name: "GET /v1/creators/:creatorId/stats", run: (c) => c.creator.getStats(String(sampleUserId)) },
  { group: "creator", name: "GET /v1/creators/dashboard/summary", run: (c) => c.creator.getDashboardSummary() },
];

const results = [];

for (const probe of probes) {
  const started = performance.now();
  try {
    const result = await probe.run(client.baseClient);
    results.push({
      ok: true,
      group: probe.group,
      name: probe.name,
      status: result.response.status,
      ms: Math.round(performance.now() - started),
      shape: describeShape(result.data),
    });
  } catch (error) {
    results.push({
      ok: false,
      group: probe.group,
      name: probe.name,
      ...describeError(error),
      ms: Math.round(performance.now() - started),
    });
  }
}

for (const result of results) {
  console.log(JSON.stringify(result));
}

const summary = results.reduce<Record<string, { ok: number; failed: number }>>((acc, result) => {
  const group = acc[result.group] ??= { ok: 0, failed: 0 };
  if (result.ok) {
    group.ok += 1;
  } else {
    group.failed += 1;
  }
  return acc;
}, {});

console.log(JSON.stringify({ summary }, null, 2));

function describeShape(data: unknown): string {
  if (Array.isArray(data)) {
    return `array(${data.length})`;
  }

  if (data && typeof data === "object") {
    const keys = Object.keys(data).slice(0, 8);
    return `object(${keys.join(",")})`;
  }

  return typeof data;
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
