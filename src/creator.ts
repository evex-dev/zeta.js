import type { BaseClient } from "./core/client.ts";
import type { AnyData, CreatorDashboardPlotStats, CreatorDashboardQuery, CreatorFollowNotificationRequest, UserListQuery, UserListResponse } from "./domainTypes.ts";

export type FollowState = AnyData & {
  follow?: boolean;
  following?: boolean;
  followed?: boolean;
  notificationEnabled?: boolean;
};

export type CreatorStats = AnyData & {
  followerCount?: number;
  followingCount?: number;
  plotCount?: number;
  privatePlotCount?: number;
  preReleasePlotCount?: number;
  interactionCount?: number;
  plotInteractionCount?: number;
  voicePlaySeconds?: number;
  followerCountIncrease?: number;
};

export type CreatorDashboardSummary = AnyData & {
  plots?: unknown[];
  stats?: CreatorStats;
  plotInteractionCount?: number;
  plotInteractionCountIncrease?: number;
  plotInteractionRankPercentage?: number;
  plotCount?: number;
  preReleasePlotCount?: number;
  recentPlot?: unknown;
  recentPlotStatIncrease?: unknown;
  lorebookInteractionCount?: number;
};
export class CreatorApi {
  constructor(private readonly client: BaseClient) {}

  getFollowState(creatorId: string) {
    return this.client.get<FollowState>("/v1/creators/:creatorId/follow", { path: { creatorId } });
  }

  follow(creatorId: string) {
    return this.client.post("/v1/creators/:creatorId/follow", undefined, { path: { creatorId } });
  }

  unfollow(creatorId: string) {
    return this.client.delete("/v1/creators/:creatorId/follow", { path: { creatorId } });
  }

  updateFollowNotification(creatorId: string, body?: CreatorFollowNotificationRequest) {
    return this.client.post("/v1/creators/:creatorId/follow/notification", body, { path: { creatorId } });
  }

  listFollowings(creatorId: string, query?: UserListQuery) {
    return this.client.get<UserListResponse>("/v1/creators/:creatorId/followings", { path: { creatorId }, query });
  }

  listFollowers(creatorId: string, query?: UserListQuery) {
    return this.client.get<UserListResponse>("/v1/creators/:creatorId/followers", { path: { creatorId }, query });
  }

  getMyFollowingCount() {
    return this.client.get<{ count?: number; [key: string]: unknown }>("/v1/creators/me/followings/count");
  }

  getMyStats() {
    return this.client.get<CreatorStats>("/v1/creators/me/stats");
  }

  getStats(creatorId: string) {
    return this.client.get<CreatorStats>("/v1/creators/:creatorId/stats", { path: { creatorId } });
  }

  getDashboardSummary(query?: CreatorDashboardQuery) {
    return this.client.get<CreatorDashboardSummary>("/v1/creators/dashboard/summary", { query });
  }

  getDashboardPlotStats(plotId: string, query?: CreatorDashboardQuery) {
    return this.client.get<CreatorDashboardPlotStats>("/v1/creators/dashboard/plots/:plotId/stats", { path: { plotId }, query });
  }
}

export function createCreatorApi(client: BaseClient): CreatorApi {
  return new CreatorApi(client);
}
