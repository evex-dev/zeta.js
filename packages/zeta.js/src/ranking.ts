import type { BaseClient } from "./core/client.ts";
import type { ApiResult } from "./core/types.ts";
import type { AnyData, PlotListQuery, PlotListResponse } from "./domainTypes.ts";

export type GenreRanking = AnyData & {
  key?: string;
  name?: string;
  displayName?: string;
  rank?: number;
};

export type GenreRankingResponse = AnyData & {
  genres?: GenreRanking[];
  rankings?: GenreRanking[];
};
export class RankingApi {
  constructor(private readonly client: BaseClient) {}

  getPlotRanking(query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/plots/ranking", { query });
  }

  getGenresRanking(query?: PlotListQuery): Promise<ApiResult<GenreRankingResponse>> {
    return this.client.get<GenreRankingResponse>("/v1/genres/ranking", { query });
  }

  getTopicPlotRankings(topicId: string, query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/topics/:topicId/plot-rankings", { path: { topicId }, query });
  }

  getHashtagTopicPlots(hashtagTopicId: string, query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/hashtag-topics/:hashtagTopicId/plots", { path: { hashtagTopicId }, query });
  }
}

export function createRankingApi(client: BaseClient): RankingApi {
  return new RankingApi(client);
}
