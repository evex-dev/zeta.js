import type { BaseClient } from "./core/client.ts";
import type { ApiResult } from "./core/types.ts";
import { ApiError } from "./core/types.ts";
import type {
  AppendPlotImagesRequest,
  AnyData,
  ExampleChatResponse,
  ExtractProfileImageTagsRequest,
  BlockedPlotsResponse,
  ImageCreatorRequest,
  ImageCropRequest,
  CursorListQuery,
  IdQuery,
  ImageHistoryQuery,
  ImageRatingRequest,
  LinkLorebookRequest,
  MultipartImageBody,
  Plot,
  PlotBlockRequest,
  PlotCountResponse,
  PlotDraftRequest,
  HashtagBlockRequest,
  PlotImageListResponse,
  PlotLikeState,
  PlotLikeRequest,
  PlotListQuery,
  PlotListResponse,
  PlotNameCheckQuery,
  PlotNameCheckResponse,
  PlotProfileImageGenerationJob,
  PlotProfileImageGenerationResult,
  PlotProfileImageHistoryResponse,
  PlotProfileImageSavedResultListResponse,
  PlotPrivateRequest,
  PlotRecommendedMessagesRequest,
  PlotSummary,
  PlotStatusRequest,
  PlotUnlimitedRequest,
  ProfileImageTagResponse,
  ProfileImageTagQuery,
  PlotSearchQuery,
  RegisterProfileImageJobRequest,
  RecommendedMessagesQuotaResponse,
  RecentPreReleasePlotResponse,
  ReportRequest,
  SaveProfileImageResultRequest,
  SelectedPlayerCharacterResponse,
  TranslateProfileImageTagsRequest,
} from "./domainTypes.ts";

export type CountResponse = AnyData & {
  count?: number;
};

export class PlotResource {
  private plotData?: Plot;

  constructor(private readonly api: PlotsApi, readonly id: string, plot?: Plot) {
    this.plotData = plot;
  }

  get data(): Plot | undefined {
    return this.plotData;
  }

  async refresh(query?: IdQuery): Promise<ApiResult<Plot>> {
    const result = await this.api.getPlot(this.id, query);
    this.plotData = result.data;
    return result;
  }

  async update(body?: PlotDraftRequest): Promise<ApiResult<Plot>> {
    const result = await this.api.updatePlot(this.id, body);
    this.plotData = result.data;
    return result;
  }

  async patch(body?: PlotDraftRequest): Promise<ApiResult<Plot>> {
    const result = await this.api.patchPlot(this.id, body);
    this.plotData = result.data;
    return result;
  }

  updateStatus(body: PlotStatusRequest): Promise<ApiResult<Plot>> {
    return this.api.updatePlotStatus(this.id, body);
  }

  setPrivate(body: PlotPrivateRequest): Promise<ApiResult<Plot>> {
    return this.api.setPlotPrivate(this.id, body);
  }

  setUnlimited(body?: PlotUnlimitedRequest): Promise<ApiResult<unknown>> {
    return this.api.setPlotUnlimited(this.id, body);
  }

  getViewer(): Promise<ApiResult<Plot>> {
    return this.api.getPlotViewer(this.id);
  }

  getCreator(): Promise<ApiResult<Plot>> {
    return this.api.getPlotCreator(this.id);
  }

  listSimilar(query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.api.listSimilarPlots(this.id, query);
  }

  getLikes(): Promise<ApiResult<PlotLikeState>> {
    return this.api.getPlotLikes(this.id);
  }

  like(body?: PlotLikeRequest): Promise<ApiResult<unknown>> {
    return this.api.likePlot(this.id, body);
  }

  unlike(): Promise<ApiResult<unknown>> {
    return this.api.unlikePlot(this.id);
  }

  report(body?: ReportRequest): Promise<ApiResult<unknown>> {
    return this.api.reportPlot(this.id, body);
  }

  async createPrivateSnapshot(body?: PlotDraftRequest): Promise<PlotResource> {
    const result = await this.api.createPrivateSnapshot(this.id, body);
    return this.api.fromData(result.data);
  }

  createRecommendedMessages(body?: PlotRecommendedMessagesRequest): Promise<ApiResult<unknown>> {
    return this.api.createRecommendedMessages(this.id, body);
  }

  getExampleChat(query?: IdQuery): Promise<ApiResult<ExampleChatResponse>> {
    return this.api.getExampleChat(this.id, query);
  }

  listAboutImages(query?: ImageHistoryQuery): Promise<ApiResult<PlotImageListResponse>> {
    return this.api.listAboutImages(this.id, query);
  }

  appendAboutImages(body?: AppendPlotImagesRequest): Promise<ApiResult<PlotImageListResponse>> {
    return this.api.appendAboutImages(this.id, body);
  }

  listIntroImages(query?: ImageHistoryQuery): Promise<ApiResult<PlotImageListResponse>> {
    return this.api.listIntroImages(this.id, query);
  }

  getSummary(): Promise<ApiResult<PlotSummary>> {
    return this.api.getPlotSummary(this.id);
  }

  linkLorebook(lorebookId: string, body?: LinkLorebookRequest): Promise<ApiResult<unknown>> {
    return this.api.linkLorebook(this.id, lorebookId, body);
  }

  unlinkLorebook(lorebookId: string): Promise<ApiResult<unknown>> {
    return this.api.unlinkLorebook(this.id, lorebookId);
  }

  listProfileImageHistory(query?: ImageHistoryQuery): Promise<ApiResult<PlotProfileImageHistoryResponse>> {
    return this.api.listProfileImageHistory(this.id, query);
  }

  registerProfileImageJob(body?: RegisterProfileImageJobRequest): Promise<ApiResult<PlotProfileImageGenerationJob>> {
    return this.api.registerProfileImageJob(this.id, body);
  }

  previewAllCharacterImages(query?: ImageHistoryQuery): Promise<ApiResult<PlotImageListResponse>> {
    return this.api.previewAllCharacterImages(this.id, query);
  }

  createCharacterImage(characterId: string, body?: ImageCreatorRequest): Promise<ApiResult<PlotImageListResponse>> {
    return this.api.createCharacterImage(this.id, characterId, body);
  }

  cropCharacterImage(characterId: string, body?: ImageCropRequest): Promise<ApiResult<PlotImageListResponse>> {
    return this.api.cropCharacterImage(this.id, characterId, body);
  }

  uploadOriginalCharacterImage(characterId: string, body: MultipartImageBody): Promise<ApiResult<PlotImageListResponse>> {
    return this.api.uploadOriginalCharacterImage(this.id, characterId, body);
  }

  rateCharacterImage(characterId: string, body?: ImageRatingRequest): Promise<ApiResult<unknown>> {
    return this.api.rateCharacterImage(this.id, characterId, body);
  }

  cropChatProfileImage(chatProfileId: string, body?: ImageCropRequest): Promise<ApiResult<PlotImageListResponse>> {
    return this.api.cropChatProfileImage(this.id, chatProfileId, body);
  }

  uploadOriginalChatProfileImage(chatProfileId: string, body: MultipartImageBody): Promise<ApiResult<PlotImageListResponse>> {
    return this.api.uploadOriginalChatProfileImage(this.id, chatProfileId, body);
  }

  createImage(body?: ImageCreatorRequest): Promise<ApiResult<PlotImageListResponse>> {
    return this.api.createPlotImage(this.id, body);
  }

  previewImage(query?: ImageHistoryQuery): Promise<ApiResult<PlotImageListResponse>> {
    return this.api.previewPlotImage(this.id, query);
  }

  cropImage(body?: ImageCropRequest): Promise<ApiResult<PlotImageListResponse>> {
    return this.api.cropPlotImage(this.id, body);
  }

  uploadOriginalImage(body: MultipartImageBody): Promise<ApiResult<PlotImageListResponse>> {
    return this.api.uploadOriginalPlotImage(this.id, body);
  }

  rateImage(body?: ImageRatingRequest): Promise<ApiResult<unknown>> {
    return this.api.ratePlotImage(this.id, body);
  }
}

export class PlotsApi {
  constructor(private readonly client: BaseClient) {}

  fromId(plotId: string): PlotResource {
    return new PlotResource(this, plotId);
  }

  fromData(plot: Plot): PlotResource {
    const id = plot.id;
    if (typeof id !== "string" || id.length === 0) {
      throw new ApiError("Cannot create PlotResource because plot.id is missing.", {
        code: "MissingPlotId",
        data: plot,
      });
    }
    return new PlotResource(this, id, plot);
  }

  async create(body?: PlotDraftRequest): Promise<PlotResource> {
    const result = await this.createPlot(body);
    return this.fromData(result.data);
  }

  async get(plotId: string, query?: IdQuery): Promise<PlotResource> {
    const result = await this.getPlot(plotId, query);
    return this.fromData(result.data);
  }

  listPlots(query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/plots", { query });
  }

  createPlot(body?: PlotDraftRequest): Promise<ApiResult<Plot>> {
    return this.client.post<Plot, PlotDraftRequest | undefined>("/v1/plots", body);
  }

  getPlot(plotId: string, query?: IdQuery): Promise<ApiResult<Plot>> {
    return this.client.get<Plot>("/v1/plots/:plotId", { path: { plotId }, query });
  }

  updatePlot(plotId: string, body?: PlotDraftRequest): Promise<ApiResult<Plot>> {
    return this.client.put<Plot, PlotDraftRequest | undefined>("/v1/plots/:plotId", body, { path: { plotId } });
  }

  patchPlot(plotId: string, body?: PlotDraftRequest): Promise<ApiResult<Plot>> {
    return this.client.patch<Plot, PlotDraftRequest | undefined>("/v1/plots/:plotId", body, { path: { plotId } });
  }

  updatePlotStatus(plotId: string, body: PlotStatusRequest): Promise<ApiResult<Plot>> {
    return this.client.patch<Plot, PlotStatusRequest>("/v1/plots/:plotId/status", body, { path: { plotId } });
  }

  setPlotPrivate(plotId: string, body: PlotPrivateRequest): Promise<ApiResult<Plot>> {
    return this.client.patch<Plot, PlotPrivateRequest>("/v1/plots/:plotId/private", body, { path: { plotId } });
  }

  setPlotUnlimited(plotId: string, body?: PlotUnlimitedRequest): Promise<ApiResult<unknown>> {
    return this.client.put("/v1/plots/:plotId/unlimited", body, { path: { plotId } });
  }

  getPlotViewer(plotId: string): Promise<ApiResult<Plot>> {
    return this.client.get<Plot>("/v1/plots/:plotId/viewer", { path: { plotId } });
  }

  getPlotCreator(plotId: string): Promise<ApiResult<Plot>> {
    return this.client.get<Plot>("/v1/plots/:plotId/creator", { path: { plotId } });
  }

  listCreatorPlots(query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/plots/creator", { query });
  }

  listSimilarPlots(plotId: string, query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/plots/:plotId/similar-plots", { path: { plotId }, query });
  }

  getRandomRecentlyCreated(query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/plots/random-recently-created", { query });
  }

  getPrereleaseRecent(query?: PlotListQuery): Promise<ApiResult<RecentPreReleasePlotResponse>> {
    return this.client.get<RecentPreReleasePlotResponse>("/v1/plots/prerelease/recent", { query });
  }

  checkPlotName(query: PlotNameCheckQuery): Promise<ApiResult<PlotNameCheckResponse>> {
    return this.client.get<PlotNameCheckResponse>("/v1/plots/check-name", { query });
  }

  getPlotLikes(plotId: string): Promise<ApiResult<PlotLikeState>> {
    return this.client.get<PlotLikeState>("/v1/plots/:plotId/likes", { path: { plotId } });
  }

  likePlot(plotId: string, body?: PlotLikeRequest): Promise<ApiResult<unknown>> {
    return this.client.put("/v1/plots/:plotId/likes", body, { path: { plotId } });
  }

  unlikePlot(plotId: string): Promise<ApiResult<unknown>> {
    return this.client.delete("/v1/plots/:plotId/likes", { path: { plotId } });
  }

  listLikedPlots(query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/plots/liked", { query });
  }

  getLikedPlotCount(): Promise<ApiResult<CountResponse>> {
    return this.client.get<CountResponse>("/v1/plots/liked/count");
  }

  listBlockedPlots(query?: PlotListQuery): Promise<ApiResult<BlockedPlotsResponse>> {
    return this.client.get<BlockedPlotsResponse>("/v1/plots/blocks", { query });
  }

  blockPlot(body: PlotBlockRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/plots/blocks", body);
  }

  unblockPlot(body: PlotBlockRequest): Promise<ApiResult<unknown>> {
    return this.client.request("DELETE", "/v1/plots/blocks", { body });
  }

  listBlockedHashtags(query?: CursorListQuery): Promise<ApiResult<{ [key: string]: unknown; hashtags?: string[]; }>> {
    return this.client.get<{ hashtags?: string[]; [key: string]: unknown }>("/v1/plots/hashtags/blocks", { query });
  }

  blockHashtag(body: HashtagBlockRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/plots/hashtags/blocks", body);
  }

  unblockHashtag(body: HashtagBlockRequest): Promise<ApiResult<unknown>> {
    return this.client.request("DELETE", "/v1/plots/hashtags/blocks", { body });
  }

  reportPlot(plotId: string, body?: ReportRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/plots/:plotId/reports", body, { path: { plotId } });
  }

  createPrivateSnapshot(plotId: string, body?: PlotDraftRequest): Promise<ApiResult<Plot>> {
    return this.client.post<Plot, PlotDraftRequest | undefined>("/v1/plots/:plotId/private-snapshots", body, { path: { plotId } });
  }

  createRecommendedMessages(plotId: string, body?: PlotRecommendedMessagesRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/plots/:plotId/recommended-messages", body, { path: { plotId } });
  }

  getExampleChat(plotId: string, query?: IdQuery): Promise<ApiResult<ExampleChatResponse>> {
    return this.client.get<ExampleChatResponse>("/v1/plots/:plotId/example-chat", { path: { plotId }, query });
  }

  listAboutImages(plotId: string, query?: ImageHistoryQuery): Promise<ApiResult<PlotImageListResponse>> {
    return this.client.get<PlotImageListResponse>("/v1/plots/:plotId/about-images", { path: { plotId }, query });
  }

  appendAboutImages(plotId: string, body?: AppendPlotImagesRequest): Promise<ApiResult<PlotImageListResponse>> {
    return this.client.post<PlotImageListResponse, AppendPlotImagesRequest | undefined>("/v1/plots/:plotId/about-images", body, { path: { plotId } });
  }

  listIntroImages(plotId: string, query?: ImageHistoryQuery): Promise<ApiResult<PlotImageListResponse>> {
    return this.client.get<PlotImageListResponse>("/v1/plots/:plotId/intro-images", { path: { plotId }, query });
  }

  getPlotUserPersonaSelectedPlayerCharacter(plotId: string, roomId: string, query?: IdQuery): Promise<ApiResult<SelectedPlayerCharacterResponse>> {
    return this.client.get<SelectedPlayerCharacterResponse>("/v1/plots/:plotId/rooms/:roomId/user-personas/selected-player-character", { path: { plotId, roomId }, query });
  }

  getPlotSummary(plotId: string): Promise<ApiResult<PlotSummary>> {
    return this.client.get<PlotSummary>("/v1/plot-summaries/:plotId", { path: { plotId } });
  }

  getPlotSummaryByIdentifier(plotIdentifier: string): Promise<ApiResult<PlotSummary>> {
    return this.client.get<PlotSummary>("/v1/plot-summaries/:plotIdentifier", { path: { plotIdentifier } });
  }

  listPlotPoolPlots(poolId: string, query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/plot-pools/:poolId/plots", { path: { poolId }, query });
  }

  linkLorebook(plotId: string, lorebookId: string, body?: LinkLorebookRequest): Promise<ApiResult<unknown>> {
    return this.client.put("/v1/plots/:plotId/lorebooks/:lorebookId", body, { path: { plotId, lorebookId } });
  }

  unlinkLorebook(plotId: string, lorebookId: string): Promise<ApiResult<unknown>> {
    return this.client.delete("/v1/plots/:plotId/lorebooks/:lorebookId", { path: { plotId, lorebookId } });
  }

  getSavedProfileImageCount(): Promise<ApiResult<CountResponse>> {
    return this.client.get<CountResponse>("/v1/plots/saved-profile-image/count");
  }

  listSavedProfileImages(query?: ImageHistoryQuery): Promise<ApiResult<PlotProfileImageSavedResultListResponse>> {
    return this.client.get<PlotProfileImageSavedResultListResponse>("/v1/plots/saved-profile-image/list", { query });
  }

  saveProfileImageResult(profileImageResultId: string, body?: SaveProfileImageResultRequest): Promise<ApiResult<PlotProfileImageGenerationResult>> {
    return this.client.post<PlotProfileImageGenerationResult, SaveProfileImageResultRequest | undefined>("/v1/plots/saved-profile-image/profile-image-result/:profileImageResultId", body, { path: { profileImageResultId } });
  }

  listProfileImageHistory(plotId: string, query?: ImageHistoryQuery): Promise<ApiResult<PlotProfileImageHistoryResponse>> {
    return this.client.get<PlotProfileImageHistoryResponse>("/v1/plots/profile-image/:plotId/history", { path: { plotId }, query });
  }

  registerProfileImageJob(plotId: string, body?: RegisterProfileImageJobRequest): Promise<ApiResult<PlotProfileImageGenerationJob>> {
    return this.client.post<PlotProfileImageGenerationJob, RegisterProfileImageJobRequest | undefined>("/v1/plots/profile-image/:plotId/job/register", body, { path: { plotId } });
  }

  getProfileImageJob(jobId: string): Promise<ApiResult<PlotProfileImageGenerationJob>> {
    return this.client.get<PlotProfileImageGenerationJob>("/v1/plots/profile-image/job/:jobId", { path: { jobId } });
  }

  getProfileImageResult(profileImageResultId: string): Promise<ApiResult<PlotProfileImageGenerationResult>> {
    return this.client.get<PlotProfileImageGenerationResult>("/v1/plots/profile-image/result/:profileImageResultId", { path: { profileImageResultId } });
  }

  reportProfileImageResult(profileImageResultId: string, body?: ReportRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/plots/profile-image/result/:profileImageResultId/report", body, { path: { profileImageResultId } });
  }

  extractProfileImageTags(body?: ExtractProfileImageTagsRequest): Promise<ApiResult<ProfileImageTagResponse>> {
    return this.client.post<ProfileImageTagResponse, ExtractProfileImageTagsRequest | undefined>("/v1/plots/profile-image/tool/extract-tag", body);
  }

  translateProfileImageTags(body?: TranslateProfileImageTagsRequest): Promise<ApiResult<ProfileImageTagResponse>> {
    return this.client.post<ProfileImageTagResponse, TranslateProfileImageTagsRequest | undefined>("/v1/plots/profile-image/tool/translate", body);
  }

  listProfileImageToolTags(query?: ProfileImageTagQuery): Promise<ApiResult<ProfileImageTagResponse>> {
    return this.client.get<ProfileImageTagResponse>("/v1/plots/profile-image/tool/tags", { query });
  }

  getSearchPlotCount(query?: PlotSearchQuery): Promise<ApiResult<PlotCountResponse>> {
    return this.client.get<PlotCountResponse>("/v1/plots/search/plot-count", { query });
  }

  getRecommendedMessagesQuota(): Promise<ApiResult<RecommendedMessagesQuotaResponse>> {
    return this.client.get<RecommendedMessagesQuotaResponse>("/v1/recommended-messages/quota");
  }

  previewAllCharacterImages(plotId: string, query?: ImageHistoryQuery): Promise<ApiResult<PlotImageListResponse>> {
    return this.client.get<PlotImageListResponse>("/v2/plots/:plotId/all-character-images/preview", { path: { plotId }, query });
  }

  createCharacterImage(plotId: string, characterId: string, body?: ImageCreatorRequest): Promise<ApiResult<PlotImageListResponse>> {
    return this.client.post<PlotImageListResponse, ImageCreatorRequest | undefined>("/v2/plots/:plotId/characters/:characterId/images/creator", body, { path: { plotId, characterId } });
  }

  cropCharacterImage(plotId: string, characterId: string, body?: ImageCropRequest): Promise<ApiResult<PlotImageListResponse>> {
    return this.client.post<PlotImageListResponse, ImageCropRequest | undefined>("/v2/plots/:plotId/characters/:characterId/images/crop", body, { path: { plotId, characterId } });
  }

  uploadOriginalCharacterImage(plotId: string, characterId: string, body: MultipartImageBody): Promise<ApiResult<PlotImageListResponse>> {
    return this.client.post<PlotImageListResponse, MultipartImageBody>("/v2/plots/:plotId/characters/:characterId/images/original", body, { path: { plotId, characterId }, multipart: true });
  }

  rateCharacterImage(plotId: string, characterId: string, body?: ImageRatingRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v2/plots/:plotId/characters/:characterId/images/ratings", body, { path: { plotId, characterId } });
  }

  cropChatProfileImage(plotId: string, chatProfileId: string, body?: ImageCropRequest): Promise<ApiResult<PlotImageListResponse>> {
    return this.client.post<PlotImageListResponse, ImageCropRequest | undefined>("/v2/plots/:plotId/chat-profiles/:chatProfileId/images/crop", body, { path: { plotId, chatProfileId } });
  }

  uploadOriginalChatProfileImage(plotId: string, chatProfileId: string, body: MultipartImageBody): Promise<ApiResult<PlotImageListResponse>> {
    return this.client.post<PlotImageListResponse, MultipartImageBody>("/v2/plots/:plotId/chat-profiles/:chatProfileId/images/original", body, { path: { plotId, chatProfileId }, multipart: true });
  }

  createPlotImage(plotId: string, body?: ImageCreatorRequest): Promise<ApiResult<PlotImageListResponse>> {
    return this.client.post<PlotImageListResponse, ImageCreatorRequest | undefined>("/v2/plots/:plotId/images/creator", body, { path: { plotId } });
  }

  previewPlotImage(plotId: string, query?: ImageHistoryQuery): Promise<ApiResult<PlotImageListResponse>> {
    return this.client.get<PlotImageListResponse>("/v2/plots/:plotId/images/creator/preview", { path: { plotId }, query });
  }

  cropPlotImage(plotId: string, body?: ImageCropRequest): Promise<ApiResult<PlotImageListResponse>> {
    return this.client.post<PlotImageListResponse, ImageCropRequest | undefined>("/v2/plots/:plotId/images/crop", body, { path: { plotId } });
  }

  uploadOriginalPlotImage(plotId: string, body: MultipartImageBody): Promise<ApiResult<PlotImageListResponse>> {
    return this.client.post<PlotImageListResponse, MultipartImageBody>("/v2/plots/:plotId/images/original", body, { path: { plotId }, multipart: true });
  }

  ratePlotImage(plotId: string, body?: ImageRatingRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v2/plots/:plotId/images/ratings", body, { path: { plotId } });
  }
}

export function createPlotsApi(client: BaseClient): PlotsApi {
  return new PlotsApi(client);
}
