import type { BaseClient } from "./core/client.ts";
import type { ApiResult } from "./core/types.ts";
import { ApiError } from "./core/types.ts";
import type {
  AnyData,
  LinkLorebookRequest,
  Lorebook,
  LorebookCheckContentsRequest,
  LorebookDraftRequest,
  LorebookListQuery,
  LorebookListResponse,
  LorebookPlotStats,
  LorebookTitleCheckQuery,
  PlotListResponse,
  ReportRequest,
} from "./domainTypes.ts";

export type ValidationResponse = AnyData & {
  valid?: boolean;
  available?: boolean;
  reason?: string;
  code?: string;
};

export class LorebookResource {
  private lorebookData?: Lorebook;

  constructor(private readonly api: LorebooksApi, readonly id: string, lorebook?: Lorebook) {
    this.lorebookData = lorebook;
  }

  get data(): Lorebook | undefined {
    return this.lorebookData;
  }

  async refresh(): Promise<ApiResult<Lorebook>> {
    const result = await this.api.getLorebook(this.id);
    this.lorebookData = result.data;
    return result;
  }

  async update(body?: LorebookDraftRequest): Promise<ApiResult<Lorebook>> {
    const result = await this.api.updateLorebook(this.id, body);
    this.lorebookData = result.data;
    return result;
  }

  delete(): Promise<ApiResult<unknown>> {
    return this.api.deleteLorebook(this.id);
  }

  report(body?: ReportRequest): Promise<ApiResult<unknown>> {
    return this.api.reportLorebook(this.id, body);
  }

  getPlotStats(): Promise<ApiResult<LorebookPlotStats>> {
    return this.api.getLorebookPlotStats(this.id);
  }

  listLinkedPlots(query?: LorebookListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.api.listLinkedPlots(this.id, query);
  }

  listMyLinkedPlots(query?: LorebookListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.api.listMyLinkedPlots(this.id, query);
  }

  linkPlot(plotId: string, body?: LinkLorebookRequest): Promise<ApiResult<unknown>> {
    return this.api.linkPlot(plotId, this.id, body);
  }

  unlinkPlot(plotId: string): Promise<ApiResult<unknown>> {
    return this.api.unlinkPlot(plotId, this.id);
  }
}

export class LorebooksApi {
  constructor(private readonly client: BaseClient) {}

  fromId(lorebookId: string): LorebookResource {
    return new LorebookResource(this, lorebookId);
  }

  fromData(lorebook: Lorebook): LorebookResource {
    const id = lorebook.id;
    if (typeof id !== "string" || id.length === 0) {
      throw new ApiError("Cannot create LorebookResource because lorebook.id is missing.", {
        code: "MissingLorebookId",
        data: lorebook,
      });
    }
    return new LorebookResource(this, id, lorebook);
  }

  async create(body?: LorebookDraftRequest): Promise<LorebookResource> {
    const result = await this.createLorebook(body);
    return this.fromData(result.data);
  }

  async get(id: string): Promise<LorebookResource> {
    const result = await this.getLorebook(id);
    return this.fromData(result.data);
  }

  listLorebooks(query?: LorebookListQuery): Promise<ApiResult<LorebookListResponse>> {
    return this.client.get<LorebookListResponse>("/v1/lorebooks", { query });
  }

  createLorebook(body?: LorebookDraftRequest): Promise<ApiResult<Lorebook>> {
    return this.client.post<Lorebook, LorebookDraftRequest | undefined>("/v1/lorebooks", body);
  }

  getLorebook(id: string): Promise<ApiResult<Lorebook>> {
    return this.client.get<Lorebook>("/v1/lorebooks/:id", { path: { id } });
  }

  updateLorebook(id: string, body?: LorebookDraftRequest): Promise<ApiResult<Lorebook>> {
    return this.client.put<Lorebook, LorebookDraftRequest | undefined>("/v1/lorebooks/:id", body, { path: { id } });
  }

  deleteLorebook(id: string): Promise<ApiResult<unknown>> {
    return this.client.delete("/v1/lorebooks/:id", { path: { id } });
  }

  listCreatorLorebooks(query?: LorebookListQuery): Promise<ApiResult<LorebookListResponse>> {
    return this.client.get<LorebookListResponse>("/v1/lorebooks/creator", { query });
  }

  reportLorebook(lorebookId: string, body?: ReportRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/lorebooks/:lorebookId/reports", body, { path: { lorebookId } });
  }

  getLorebookPlotStats(lorebookId: string): Promise<ApiResult<LorebookPlotStats>> {
    return this.client.get<LorebookPlotStats>("/v1/lorebooks/:lorebookId/plot-stats", { path: { lorebookId } });
  }

  listLinkedPlots(lorebookId: string, query?: LorebookListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/lorebooks/:lorebookId/plots", { path: { lorebookId }, query });
  }

  listMyLinkedPlots(lorebookId: string, query?: LorebookListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/lorebooks/:lorebookId/my-plots", { path: { lorebookId }, query });
  }

  checkContents(body?: LorebookCheckContentsRequest): Promise<ApiResult<ValidationResponse>> {
    return this.client.post<ValidationResponse>("/v1/lorebooks/check-contents", body);
  }

  checkTitle(query: LorebookTitleCheckQuery): Promise<ApiResult<ValidationResponse>> {
    return this.client.get<ValidationResponse>("/v1/lorebooks/check-title", { query });
  }

  searchLorebooks(query?: LorebookListQuery): Promise<ApiResult<LorebookListResponse>> {
    return this.client.get<LorebookListResponse>("/v1/lorebooks/search", { query });
  }

  searchCreatorCenterLorebooks(query?: LorebookListQuery): Promise<ApiResult<LorebookListResponse>> {
    return this.client.get<LorebookListResponse>("/v1/lorebooks/creator-center/search", { query });
  }

  getRecommendedLorebooks(query?: LorebookListQuery): Promise<ApiResult<LorebookListResponse>> {
    return this.client.get<LorebookListResponse>("/v1/lorebooks/discovery/recommend", { query });
  }

  getRecommendedLorebookKeywords(query?: LorebookListQuery): Promise<ApiResult<{ [key: string]: unknown; keywords?: string[]; }>> {
    return this.client.get<{ keywords?: string[]; [key: string]: unknown }>("/v1/lorebooks/discovery/recommend-keyword-list", { query });
  }

  getRecentPlayLorebooks(query?: LorebookListQuery): Promise<ApiResult<LorebookListResponse>> {
    return this.client.get<LorebookListResponse>("/v1/lorebooks/discovery/recent-play", { query });
  }

  getPopularLorebooks(query?: LorebookListQuery): Promise<ApiResult<LorebookListResponse>> {
    return this.client.get<LorebookListResponse>("/v1/lorebooks/discovery/popular", { query });
  }

  getPopularLorebooksByChat(query?: LorebookListQuery): Promise<ApiResult<LorebookListResponse>> {
    return this.client.get<LorebookListResponse>("/v1/lorebooks/discovery/popular_by_chat", { query });
  }

  linkPlot(plotId: string, lorebookId: string, body?: LinkLorebookRequest): Promise<ApiResult<unknown>> {
    return this.client.put("/v1/plots/:plotId/lorebooks/:lorebookId", body, { path: { plotId, lorebookId } });
  }

  unlinkPlot(plotId: string, lorebookId: string): Promise<ApiResult<unknown>> {
    return this.client.delete("/v1/plots/:plotId/lorebooks/:lorebookId", { path: { plotId, lorebookId } });
  }
}

export function createLorebooksApi(client: BaseClient): LorebooksApi {
  return new LorebooksApi(client);
}
