import type { BaseClient } from "./core/client.ts";
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

  async refresh(query?: IdQuery) {
    const result = await this.api.getPlot(this.id, query);
    this.plotData = result.data;
    return result;
  }

  async update(body?: PlotDraftRequest) {
    const result = await this.api.updatePlot(this.id, body);
    this.plotData = result.data;
    return result;
  }

  async patch(body?: PlotDraftRequest) {
    const result = await this.api.patchPlot(this.id, body);
    this.plotData = result.data;
    return result;
  }

  updateStatus(body: PlotStatusRequest) {
    return this.api.updatePlotStatus(this.id, body);
  }

  setPrivate(body: PlotPrivateRequest) {
    return this.api.setPlotPrivate(this.id, body);
  }

  setUnlimited(body?: PlotUnlimitedRequest) {
    return this.api.setPlotUnlimited(this.id, body);
  }

  getViewer() {
    return this.api.getPlotViewer(this.id);
  }

  getCreator() {
    return this.api.getPlotCreator(this.id);
  }

  listSimilar(query?: PlotListQuery) {
    return this.api.listSimilarPlots(this.id, query);
  }

  getLikes() {
    return this.api.getPlotLikes(this.id);
  }

  like(body?: PlotLikeRequest) {
    return this.api.likePlot(this.id, body);
  }

  unlike() {
    return this.api.unlikePlot(this.id);
  }

  report(body?: ReportRequest) {
    return this.api.reportPlot(this.id, body);
  }

  async createPrivateSnapshot(body?: PlotDraftRequest): Promise<PlotResource> {
    const result = await this.api.createPrivateSnapshot(this.id, body);
    return this.api.fromData(result.data);
  }

  createRecommendedMessages(body?: PlotRecommendedMessagesRequest) {
    return this.api.createRecommendedMessages(this.id, body);
  }

  getExampleChat(query?: IdQuery) {
    return this.api.getExampleChat(this.id, query);
  }

  listAboutImages(query?: ImageHistoryQuery) {
    return this.api.listAboutImages(this.id, query);
  }

  appendAboutImages(body?: AppendPlotImagesRequest) {
    return this.api.appendAboutImages(this.id, body);
  }

  listIntroImages(query?: ImageHistoryQuery) {
    return this.api.listIntroImages(this.id, query);
  }

  getSummary() {
    return this.api.getPlotSummary(this.id);
  }

  linkLorebook(lorebookId: string, body?: LinkLorebookRequest) {
    return this.api.linkLorebook(this.id, lorebookId, body);
  }

  unlinkLorebook(lorebookId: string) {
    return this.api.unlinkLorebook(this.id, lorebookId);
  }

  listProfileImageHistory(query?: ImageHistoryQuery) {
    return this.api.listProfileImageHistory(this.id, query);
  }

  registerProfileImageJob(body?: RegisterProfileImageJobRequest) {
    return this.api.registerProfileImageJob(this.id, body);
  }

  previewAllCharacterImages(query?: ImageHistoryQuery) {
    return this.api.previewAllCharacterImages(this.id, query);
  }

  createCharacterImage(characterId: string, body?: ImageCreatorRequest) {
    return this.api.createCharacterImage(this.id, characterId, body);
  }

  cropCharacterImage(characterId: string, body?: ImageCropRequest) {
    return this.api.cropCharacterImage(this.id, characterId, body);
  }

  uploadOriginalCharacterImage(characterId: string, body: MultipartImageBody) {
    return this.api.uploadOriginalCharacterImage(this.id, characterId, body);
  }

  rateCharacterImage(characterId: string, body?: ImageRatingRequest) {
    return this.api.rateCharacterImage(this.id, characterId, body);
  }

  cropChatProfileImage(chatProfileId: string, body?: ImageCropRequest) {
    return this.api.cropChatProfileImage(this.id, chatProfileId, body);
  }

  uploadOriginalChatProfileImage(chatProfileId: string, body: MultipartImageBody) {
    return this.api.uploadOriginalChatProfileImage(this.id, chatProfileId, body);
  }

  createImage(body?: ImageCreatorRequest) {
    return this.api.createPlotImage(this.id, body);
  }

  previewImage(query?: ImageHistoryQuery) {
    return this.api.previewPlotImage(this.id, query);
  }

  cropImage(body?: ImageCropRequest) {
    return this.api.cropPlotImage(this.id, body);
  }

  uploadOriginalImage(body: MultipartImageBody) {
    return this.api.uploadOriginalPlotImage(this.id, body);
  }

  rateImage(body?: ImageRatingRequest) {
    return this.api.ratePlotImage(this.id, body);
  }
}

export class PlotsApi {
  constructor(private readonly client: BaseClient) {}

  fromId(plotId: string) {
    return new PlotResource(this, plotId);
  }

  fromData(plot: Plot) {
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

  listPlots(query?: PlotListQuery) {
    return this.client.get<PlotListResponse>("/v1/plots", { query });
  }

  createPlot(body?: PlotDraftRequest) {
    return this.client.post<Plot, PlotDraftRequest | undefined>("/v1/plots", body);
  }

  getPlot(plotId: string, query?: IdQuery) {
    return this.client.get<Plot>("/v1/plots/:plotId", { path: { plotId }, query });
  }

  updatePlot(plotId: string, body?: PlotDraftRequest) {
    return this.client.put<Plot, PlotDraftRequest | undefined>("/v1/plots/:plotId", body, { path: { plotId } });
  }

  patchPlot(plotId: string, body?: PlotDraftRequest) {
    return this.client.patch<Plot, PlotDraftRequest | undefined>("/v1/plots/:plotId", body, { path: { plotId } });
  }

  updatePlotStatus(plotId: string, body: PlotStatusRequest) {
    return this.client.patch<Plot, PlotStatusRequest>("/v1/plots/:plotId/status", body, { path: { plotId } });
  }

  setPlotPrivate(plotId: string, body: PlotPrivateRequest) {
    return this.client.patch<Plot, PlotPrivateRequest>("/v1/plots/:plotId/private", body, { path: { plotId } });
  }

  setPlotUnlimited(plotId: string, body?: PlotUnlimitedRequest) {
    return this.client.put("/v1/plots/:plotId/unlimited", body, { path: { plotId } });
  }

  getPlotViewer(plotId: string) {
    return this.client.get<Plot>("/v1/plots/:plotId/viewer", { path: { plotId } });
  }

  getPlotCreator(plotId: string) {
    return this.client.get<Plot>("/v1/plots/:plotId/creator", { path: { plotId } });
  }

  listCreatorPlots(query?: PlotListQuery) {
    return this.client.get<PlotListResponse>("/v1/plots/creator", { query });
  }

  listSimilarPlots(plotId: string, query?: PlotListQuery) {
    return this.client.get<PlotListResponse>("/v1/plots/:plotId/similar-plots", { path: { plotId }, query });
  }

  getRandomRecentlyCreated(query?: PlotListQuery) {
    return this.client.get<PlotListResponse>("/v1/plots/random-recently-created", { query });
  }

  getPrereleaseRecent(query?: PlotListQuery) {
    return this.client.get<RecentPreReleasePlotResponse>("/v1/plots/prerelease/recent", { query });
  }

  checkPlotName(query: PlotNameCheckQuery) {
    return this.client.get<PlotNameCheckResponse>("/v1/plots/check-name", { query });
  }

  getPlotLikes(plotId: string) {
    return this.client.get<PlotLikeState>("/v1/plots/:plotId/likes", { path: { plotId } });
  }

  likePlot(plotId: string, body?: PlotLikeRequest) {
    return this.client.put("/v1/plots/:plotId/likes", body, { path: { plotId } });
  }

  unlikePlot(plotId: string) {
    return this.client.delete("/v1/plots/:plotId/likes", { path: { plotId } });
  }

  listLikedPlots(query?: PlotListQuery) {
    return this.client.get<PlotListResponse>("/v1/plots/liked", { query });
  }

  getLikedPlotCount() {
    return this.client.get<CountResponse>("/v1/plots/liked/count");
  }

  listBlockedPlots(query?: PlotListQuery) {
    return this.client.get<BlockedPlotsResponse>("/v1/plots/blocks", { query });
  }

  blockPlot(body: PlotBlockRequest) {
    return this.client.post("/v1/plots/blocks", body);
  }

  unblockPlot(body: PlotBlockRequest) {
    return this.client.request("DELETE", "/v1/plots/blocks", { body });
  }

  listBlockedHashtags(query?: CursorListQuery) {
    return this.client.get<{ hashtags?: string[]; [key: string]: unknown }>("/v1/plots/hashtags/blocks", { query });
  }

  blockHashtag(body: HashtagBlockRequest) {
    return this.client.post("/v1/plots/hashtags/blocks", body);
  }

  unblockHashtag(body: HashtagBlockRequest) {
    return this.client.request("DELETE", "/v1/plots/hashtags/blocks", { body });
  }

  reportPlot(plotId: string, body?: ReportRequest) {
    return this.client.post("/v1/plots/:plotId/reports", body, { path: { plotId } });
  }

  createPrivateSnapshot(plotId: string, body?: PlotDraftRequest) {
    return this.client.post<Plot, PlotDraftRequest | undefined>("/v1/plots/:plotId/private-snapshots", body, { path: { plotId } });
  }

  createRecommendedMessages(plotId: string, body?: PlotRecommendedMessagesRequest) {
    return this.client.post("/v1/plots/:plotId/recommended-messages", body, { path: { plotId } });
  }

  getExampleChat(plotId: string, query?: IdQuery) {
    return this.client.get<ExampleChatResponse>("/v1/plots/:plotId/example-chat", { path: { plotId }, query });
  }

  listAboutImages(plotId: string, query?: ImageHistoryQuery) {
    return this.client.get<PlotImageListResponse>("/v1/plots/:plotId/about-images", { path: { plotId }, query });
  }

  appendAboutImages(plotId: string, body?: AppendPlotImagesRequest) {
    return this.client.post<PlotImageListResponse, AppendPlotImagesRequest | undefined>("/v1/plots/:plotId/about-images", body, { path: { plotId } });
  }

  listIntroImages(plotId: string, query?: ImageHistoryQuery) {
    return this.client.get<PlotImageListResponse>("/v1/plots/:plotId/intro-images", { path: { plotId }, query });
  }

  getPlotUserPersonaSelectedPlayerCharacter(plotId: string, roomId: string, query?: IdQuery) {
    return this.client.get<SelectedPlayerCharacterResponse>("/v1/plots/:plotId/rooms/:roomId/user-personas/selected-player-character", { path: { plotId, roomId }, query });
  }

  getPlotSummary(plotId: string) {
    return this.client.get<PlotSummary>("/v1/plot-summaries/:plotId", { path: { plotId } });
  }

  getPlotSummaryByIdentifier(plotIdentifier: string) {
    return this.client.get<PlotSummary>("/v1/plot-summaries/:plotIdentifier", { path: { plotIdentifier } });
  }

  listPlotPoolPlots(poolId: string, query?: PlotListQuery) {
    return this.client.get<PlotListResponse>("/v1/plot-pools/:poolId/plots", { path: { poolId }, query });
  }

  linkLorebook(plotId: string, lorebookId: string, body?: LinkLorebookRequest) {
    return this.client.put("/v1/plots/:plotId/lorebooks/:lorebookId", body, { path: { plotId, lorebookId } });
  }

  unlinkLorebook(plotId: string, lorebookId: string) {
    return this.client.delete("/v1/plots/:plotId/lorebooks/:lorebookId", { path: { plotId, lorebookId } });
  }

  getSavedProfileImageCount() {
    return this.client.get<CountResponse>("/v1/plots/saved-profile-image/count");
  }

  listSavedProfileImages(query?: ImageHistoryQuery) {
    return this.client.get<PlotProfileImageSavedResultListResponse>("/v1/plots/saved-profile-image/list", { query });
  }

  saveProfileImageResult(profileImageResultId: string, body?: SaveProfileImageResultRequest) {
    return this.client.post<PlotProfileImageGenerationResult, SaveProfileImageResultRequest | undefined>("/v1/plots/saved-profile-image/profile-image-result/:profileImageResultId", body, { path: { profileImageResultId } });
  }

  listProfileImageHistory(plotId: string, query?: ImageHistoryQuery) {
    return this.client.get<PlotProfileImageHistoryResponse>("/v1/plots/profile-image/:plotId/history", { path: { plotId }, query });
  }

  registerProfileImageJob(plotId: string, body?: RegisterProfileImageJobRequest) {
    return this.client.post<PlotProfileImageGenerationJob, RegisterProfileImageJobRequest | undefined>("/v1/plots/profile-image/:plotId/job/register", body, { path: { plotId } });
  }

  getProfileImageJob(jobId: string) {
    return this.client.get<PlotProfileImageGenerationJob>("/v1/plots/profile-image/job/:jobId", { path: { jobId } });
  }

  getProfileImageResult(profileImageResultId: string) {
    return this.client.get<PlotProfileImageGenerationResult>("/v1/plots/profile-image/result/:profileImageResultId", { path: { profileImageResultId } });
  }

  reportProfileImageResult(profileImageResultId: string, body?: ReportRequest) {
    return this.client.post("/v1/plots/profile-image/result/:profileImageResultId/report", body, { path: { profileImageResultId } });
  }

  extractProfileImageTags(body?: ExtractProfileImageTagsRequest) {
    return this.client.post<ProfileImageTagResponse, ExtractProfileImageTagsRequest | undefined>("/v1/plots/profile-image/tool/extract-tag", body);
  }

  translateProfileImageTags(body?: TranslateProfileImageTagsRequest) {
    return this.client.post<ProfileImageTagResponse, TranslateProfileImageTagsRequest | undefined>("/v1/plots/profile-image/tool/translate", body);
  }

  listProfileImageToolTags(query?: ProfileImageTagQuery) {
    return this.client.get<ProfileImageTagResponse>("/v1/plots/profile-image/tool/tags", { query });
  }

  getSearchPlotCount(query?: PlotSearchQuery) {
    return this.client.get<PlotCountResponse>("/v1/plots/search/plot-count", { query });
  }

  getRecommendedMessagesQuota() {
    return this.client.get<RecommendedMessagesQuotaResponse>("/v1/recommended-messages/quota");
  }

  previewAllCharacterImages(plotId: string, query?: ImageHistoryQuery) {
    return this.client.get<PlotImageListResponse>("/v2/plots/:plotId/all-character-images/preview", { path: { plotId }, query });
  }

  createCharacterImage(plotId: string, characterId: string, body?: ImageCreatorRequest) {
    return this.client.post<PlotImageListResponse, ImageCreatorRequest | undefined>("/v2/plots/:plotId/characters/:characterId/images/creator", body, { path: { plotId, characterId } });
  }

  cropCharacterImage(plotId: string, characterId: string, body?: ImageCropRequest) {
    return this.client.post<PlotImageListResponse, ImageCropRequest | undefined>("/v2/plots/:plotId/characters/:characterId/images/crop", body, { path: { plotId, characterId } });
  }

  uploadOriginalCharacterImage(plotId: string, characterId: string, body: MultipartImageBody) {
    return this.client.post<PlotImageListResponse, MultipartImageBody>("/v2/plots/:plotId/characters/:characterId/images/original", body, { path: { plotId, characterId }, multipart: true });
  }

  rateCharacterImage(plotId: string, characterId: string, body?: ImageRatingRequest) {
    return this.client.post("/v2/plots/:plotId/characters/:characterId/images/ratings", body, { path: { plotId, characterId } });
  }

  cropChatProfileImage(plotId: string, chatProfileId: string, body?: ImageCropRequest) {
    return this.client.post<PlotImageListResponse, ImageCropRequest | undefined>("/v2/plots/:plotId/chat-profiles/:chatProfileId/images/crop", body, { path: { plotId, chatProfileId } });
  }

  uploadOriginalChatProfileImage(plotId: string, chatProfileId: string, body: MultipartImageBody) {
    return this.client.post<PlotImageListResponse, MultipartImageBody>("/v2/plots/:plotId/chat-profiles/:chatProfileId/images/original", body, { path: { plotId, chatProfileId }, multipart: true });
  }

  createPlotImage(plotId: string, body?: ImageCreatorRequest) {
    return this.client.post<PlotImageListResponse, ImageCreatorRequest | undefined>("/v2/plots/:plotId/images/creator", body, { path: { plotId } });
  }

  previewPlotImage(plotId: string, query?: ImageHistoryQuery) {
    return this.client.get<PlotImageListResponse>("/v2/plots/:plotId/images/creator/preview", { path: { plotId }, query });
  }

  cropPlotImage(plotId: string, body?: ImageCropRequest) {
    return this.client.post<PlotImageListResponse, ImageCropRequest | undefined>("/v2/plots/:plotId/images/crop", body, { path: { plotId } });
  }

  uploadOriginalPlotImage(plotId: string, body: MultipartImageBody) {
    return this.client.post<PlotImageListResponse, MultipartImageBody>("/v2/plots/:plotId/images/original", body, { path: { plotId }, multipart: true });
  }

  ratePlotImage(plotId: string, body?: ImageRatingRequest) {
    return this.client.post("/v2/plots/:plotId/images/ratings", body, { path: { plotId } });
  }
}

export function createPlotsApi(client: BaseClient): PlotsApi {
  return new PlotsApi(client);
}
