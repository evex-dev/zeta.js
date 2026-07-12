import type { BaseClient } from "./core/client.ts";
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

  async refresh() {
    const result = await this.api.getLorebook(this.id);
    this.lorebookData = result.data;
    return result;
  }

  async update(body?: LorebookDraftRequest) {
    const result = await this.api.updateLorebook(this.id, body);
    this.lorebookData = result.data;
    return result;
  }

  delete() {
    return this.api.deleteLorebook(this.id);
  }

  report(body?: ReportRequest) {
    return this.api.reportLorebook(this.id, body);
  }

  getPlotStats() {
    return this.api.getLorebookPlotStats(this.id);
  }

  listLinkedPlots(query?: LorebookListQuery) {
    return this.api.listLinkedPlots(this.id, query);
  }

  listMyLinkedPlots(query?: LorebookListQuery) {
    return this.api.listMyLinkedPlots(this.id, query);
  }

  linkPlot(plotId: string, body?: LinkLorebookRequest) {
    return this.api.linkPlot(plotId, this.id, body);
  }

  unlinkPlot(plotId: string) {
    return this.api.unlinkPlot(plotId, this.id);
  }
}

export class LorebooksApi {
  constructor(private readonly client: BaseClient) {}

  fromId(lorebookId: string) {
    return new LorebookResource(this, lorebookId);
  }

  fromData(lorebook: Lorebook) {
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

  listLorebooks(query?: LorebookListQuery) {
    return this.client.get<LorebookListResponse>("/v1/lorebooks", { query });
  }

  createLorebook(body?: LorebookDraftRequest) {
    return this.client.post<Lorebook, LorebookDraftRequest | undefined>("/v1/lorebooks", body);
  }

  getLorebook(id: string) {
    return this.client.get<Lorebook>("/v1/lorebooks/:id", { path: { id } });
  }

  updateLorebook(id: string, body?: LorebookDraftRequest) {
    return this.client.put<Lorebook, LorebookDraftRequest | undefined>("/v1/lorebooks/:id", body, { path: { id } });
  }

  deleteLorebook(id: string) {
    return this.client.delete("/v1/lorebooks/:id", { path: { id } });
  }

  listCreatorLorebooks(query?: LorebookListQuery) {
    return this.client.get<LorebookListResponse>("/v1/lorebooks/creator", { query });
  }

  reportLorebook(lorebookId: string, body?: ReportRequest) {
    return this.client.post("/v1/lorebooks/:lorebookId/reports", body, { path: { lorebookId } });
  }

  getLorebookPlotStats(lorebookId: string) {
    return this.client.get<LorebookPlotStats>("/v1/lorebooks/:lorebookId/plot-stats", { path: { lorebookId } });
  }

  listLinkedPlots(lorebookId: string, query?: LorebookListQuery) {
    return this.client.get<PlotListResponse>("/v1/lorebooks/:lorebookId/plots", { path: { lorebookId }, query });
  }

  listMyLinkedPlots(lorebookId: string, query?: LorebookListQuery) {
    return this.client.get<PlotListResponse>("/v1/lorebooks/:lorebookId/my-plots", { path: { lorebookId }, query });
  }

  checkContents(body?: LorebookCheckContentsRequest) {
    return this.client.post<ValidationResponse>("/v1/lorebooks/check-contents", body);
  }

  checkTitle(query: LorebookTitleCheckQuery) {
    return this.client.get<ValidationResponse>("/v1/lorebooks/check-title", { query });
  }

  searchLorebooks(query?: LorebookListQuery) {
    return this.client.get<LorebookListResponse>("/v1/lorebooks/search", { query });
  }

  searchCreatorCenterLorebooks(query?: LorebookListQuery) {
    return this.client.get<LorebookListResponse>("/v1/lorebooks/creator-center/search", { query });
  }

  getRecommendedLorebooks(query?: LorebookListQuery) {
    return this.client.get<LorebookListResponse>("/v1/lorebooks/discovery/recommend", { query });
  }

  getRecommendedLorebookKeywords(query?: LorebookListQuery) {
    return this.client.get<{ keywords?: string[]; [key: string]: unknown }>("/v1/lorebooks/discovery/recommend-keyword-list", { query });
  }

  getRecentPlayLorebooks(query?: LorebookListQuery) {
    return this.client.get<LorebookListResponse>("/v1/lorebooks/discovery/recent-play", { query });
  }

  getPopularLorebooks(query?: LorebookListQuery) {
    return this.client.get<LorebookListResponse>("/v1/lorebooks/discovery/popular", { query });
  }

  getPopularLorebooksByChat(query?: LorebookListQuery) {
    return this.client.get<LorebookListResponse>("/v1/lorebooks/discovery/popular_by_chat", { query });
  }

  linkPlot(plotId: string, lorebookId: string, body?: LinkLorebookRequest) {
    return this.client.put("/v1/plots/:plotId/lorebooks/:lorebookId", body, { path: { plotId, lorebookId } });
  }

  unlinkPlot(plotId: string, lorebookId: string) {
    return this.client.delete("/v1/plots/:plotId/lorebooks/:lorebookId", { path: { plotId, lorebookId } });
  }
}

export function createLorebooksApi(client: BaseClient): LorebooksApi {
  return new LorebooksApi(client);
}
