import type { BaseClient } from "./core/client.ts";
import type { ApiResult } from "./core/types.ts";
import type {
  AnyData,
  FeatureDiscoveryQuery,
  KeywordTestResponse,
  KeywordTestRequest,
  PlotListQuery,
  PlotListResponse,
  PlotSearchQuery,
  PlotSearchV2Query,
  PlotSearchPage,
  RecommendedKeywordsResponse,
  RecommendedPlaceholderResponse,
  RelatedKeywordsResponse,
  SpecialCuration,
} from "./domainTypes.ts";

export type AutocompletePlotsResponse = AnyData & {
  keywords?: string[];
  hashtags?: Array<{ hashtag: string; count?: number }>;
  plots?: unknown[];
  autocomplete?: string[];
};

export type HashtagTopic = AnyData & {
  id?: string;
  key?: string;
  name?: string;
  hashtag?: string;
};

export type HashtagTopicsResponse = AnyData & {
  hashtagTopics?: HashtagTopic[];
  topics?: HashtagTopic[];
  nextCursor?: string | null;
};
export class SearchApi {
  constructor(private readonly client: BaseClient) {}

  /** Retains raw v2 items and exposes ZETA results as plots for resource callers. */
  async searchPlots(query?: PlotSearchV2Query): Promise<ApiResult<PlotListResponse & PlotSearchPage>> {
    const result = await this.searchPlotsPage(query);
    return { ...result, data: { ...result.data, plots: (result.data.items ?? []).flatMap((item) => item.type === "ZETA" ? [item.plot] : []) } };
  }

  searchPlotsPage(query?: PlotSearchV2Query): Promise<ApiResult<PlotSearchPage>> {
    const normalized = query ? { ...query, keyword: query.keyword ?? query.query ?? query.q } : undefined;
    return this.client.get<PlotSearchPage>("/v2/plots/search", { query: normalized });
  }

  autocompletePlots(query?: PlotSearchV2Query): Promise<ApiResult<AutocompletePlotsResponse>> {
    return this.client.get<AutocompletePlotsResponse>("/v2/plots/search/autocomplete", { query });
  }

  /** @deprecated Not observed in the 3.51.94 snapshot; retained for older clients. Use client.api for current contracts. */
  listHashtagTopics(query?: PlotSearchQuery): Promise<ApiResult<HashtagTopicsResponse>> {
    return this.client.get<HashtagTopicsResponse>("/v1/hashtag-topics", { query });
  }

  /** @deprecated Not observed in the 3.51.94 snapshot; retained for older clients. Use client.api for current contracts. */
  getHashtagTopicPlots(hashtag: string, query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/hashtag-topics/:hashtag/plots", { path: { hashtag }, query });
  }

  /** @deprecated Not observed in the 3.51.94 snapshot; retained for older clients. Use client.api for current contracts. */
  getSpecialCuration(key: string, query?: FeatureDiscoveryQuery): Promise<ApiResult<SpecialCuration>> {
    return this.client.get<SpecialCuration>("/v1/special-curations/:key", { path: { key }, query });
  }

  /** @deprecated Not observed in the 3.51.94 snapshot; retained for older clients. Use client.api for current contracts. */
  getSpecialCurationVisibility(query?: FeatureDiscoveryQuery): Promise<ApiResult<SpecialCuration>> {
    return this.client.get<SpecialCuration>("/v1/special-curation_visible", { query });
  }

  testKeyword(body?: KeywordTestRequest): Promise<ApiResult<KeywordTestResponse>> {
    return this.client.post<KeywordTestResponse>("/v1/keywords/test", body);
  }

  getRecommendedPlaceholder(): Promise<ApiResult<RecommendedPlaceholderResponse>> {
    return this.client.get<RecommendedPlaceholderResponse>("/v1/plots/search/recommended-placeholder");
  }

  getRecommendedKeywords(query?: PlotSearchQuery): Promise<ApiResult<RecommendedKeywordsResponse>> {
    return this.client.get<RecommendedKeywordsResponse>("/v1/plots/search/keywords/recommended", { query });
  }

  getRelatedKeywords(query?: PlotSearchQuery): Promise<ApiResult<RelatedKeywordsResponse>> {
    return this.client.get<RelatedKeywordsResponse>("/v1/plots/search/related-keywords", { query });
  }

  /** @deprecated Not observed in the 3.51.94 snapshot; retained for older clients. Use client.api for current contracts. */
  getRepresentativePlotsForPreferredGenre(plotId: string, query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/genres/preferred/representative-plots/:plotId/profile", { path: { plotId }, query });
  }
}

export function createSearchApi(client: BaseClient): SearchApi {
  return new SearchApi(client);
}
