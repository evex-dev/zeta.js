import type { BaseClient } from "./core/client.ts";
import type {
  AnyData,
  FeatureDiscoveryQuery,
  KeywordTestResponse,
  PlotListQuery,
  PlotListResponse,
  PlotSearchQuery,
  RecommendedKeywordsResponse,
  RecommendedPlaceholderResponse,
  RelatedKeywordsResponse,
  SpecialCuration,
} from "./domainTypes.ts";

export type AutocompletePlotsResponse = AnyData & {
  keywords?: string[];
  hashtags?: string[];
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

  searchPlots(query?: PlotSearchQuery) {
    return this.client.get<PlotListResponse>("/v1/plots/search", { query });
  }

  autocompletePlots(query?: PlotSearchQuery) {
    return this.client.get<AutocompletePlotsResponse>("/v1/plots/search/autocomplete", { query });
  }

  listHashtagTopics(query?: PlotSearchQuery) {
    return this.client.get<HashtagTopicsResponse>("/v1/hashtag-topics", { query });
  }

  getHashtagTopicPlots(hashtag: string, query?: PlotListQuery) {
    return this.client.get<PlotListResponse>("/v1/hashtag-topics/:hashtag/plots", { path: { hashtag }, query });
  }

  getSpecialCuration(key: string, query?: FeatureDiscoveryQuery) {
    return this.client.get<SpecialCuration>("/v1/special-curations/:key", { path: { key }, query });
  }

  getSpecialCurationVisibility(query?: FeatureDiscoveryQuery) {
    return this.client.get<SpecialCuration>("/v1/special-curation_visible", { query });
  }

  testKeyword(query?: PlotSearchQuery) {
    return this.client.get<KeywordTestResponse>("/v1/keywords/test", { query });
  }

  getRecommendedPlaceholder() {
    return this.client.get<RecommendedPlaceholderResponse>("/v1/plots/search/recommended-placeholder");
  }

  getRecommendedKeywords(query?: PlotSearchQuery) {
    return this.client.get<RecommendedKeywordsResponse>("/v1/plots/search/keywords/recommended", { query });
  }

  getRelatedKeywords(query?: PlotSearchQuery) {
    return this.client.get<RelatedKeywordsResponse>("/v1/plots/search/related-keywords", { query });
  }

  getRepresentativePlotsForPreferredGenre(plotId: string, query?: PlotListQuery) {
    return this.client.get<PlotListResponse>("/v1/genres/preferred/representative-plots/:plotId/profile", { path: { plotId }, query });
  }
}

export function createSearchApi(client: BaseClient): SearchApi {
  return new SearchApi(client);
}
