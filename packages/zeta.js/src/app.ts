import type { BaseClient } from "./core/client.ts";
import type { ApiResult } from "./core/types.ts";
import type { SnapshotDto } from "./generated/dtos.ts";
import type {
  AbExperiment,
  AppExperimentQuery,
  AppPushSetting,
  AppPushTokenRequest,
  ChatMessageReportCategoriesResponse,
  ChatModelConfigQuery,
  ChatModelConfigsResponse,
  CreatorAssistantGeneratedImageResponse,
  CreatorAssistantGeneratedTextResponse,
  CreatorAssistantGenerateRequest,
  CreatorAssistantQuotaResponse,
  CreatorAssistantVibeQuery,
  CreatorAssistantVibesResponse,
  CursorListQuery,
  DailyQuiz,
  DailyQuizRewardResponse,
  DailyQuizSelectionRequest,
  DailyQuizWinnersResponse,
  FeatureDiscoveryQuery,
  LatestUpdatedAtResponse,
  NotificationItem,
  NotificationListResponse,
  NiceAdditionalAuthValidateRequest,
  NiceAdditionalAuthValidateResponse,
  NiceAdditionalAuthResponse,
  NuttyMigrationRequest,
  NuttyTokenVerificationRequest,
  NuttyUser,
  Plot,
  PlotListResponse,
  User,
  Room,
  RoomCreateRequest,
  WithdrawalRequest,
} from "./domainTypes.ts";
export class AppApi {
  constructor(private readonly client: BaseClient) {}

  getAbExperiment(experimentId: string, query?: AppExperimentQuery): Promise<ApiResult<AbExperiment>> {
    return this.client.get<AbExperiment>("/v1/ab-experiments/:experimentId", { path: { experimentId }, query });
  }

  registerPushToken(body?: AppPushTokenRequest): Promise<ApiResult<unknown>> {
    return this.client.put("/v1/app-push/tokens", body);
  }

  getPushSetting(pushType: string): Promise<ApiResult<AppPushSetting>> {
    return this.client.get<AppPushSetting>("/v1/app-push/settings/:pushType", { path: { pushType } });
  }

  updatePushSetting(pushType: string, body?: AppPushSetting): Promise<ApiResult<AppPushSetting>> {
    return this.client.put<AppPushSetting, AppPushSetting | undefined>("/v1/app-push/settings/:pushType", body, { path: { pushType } });
  }

  listNotifications(query?: CursorListQuery): Promise<ApiResult<NotificationListResponse>> {
    return this.client.get<NotificationListResponse>("/v1/notifications", { query });
  }

  /** @deprecated Not observed in the 3.51.94 snapshot; retained for older clients. Use client.api for current contracts. */
  getNotification(notificationId: string): Promise<ApiResult<NotificationItem>> {
    return this.client.get<NotificationItem>("/v1/notifications/:notificationId", { path: { notificationId } });
  }

  getNotificationsLatestUpdatedAt(): Promise<ApiResult<LatestUpdatedAtResponse>> {
    return this.client.get<LatestUpdatedAtResponse>("/v1/notifications/latest-updated-at");
  }

  /** @deprecated Not observed in the 3.51.94 snapshot; retained for older clients. Use client.api for current contracts. */
  getDailyQuiz(quizId: string): Promise<ApiResult<DailyQuiz>> {
    return this.client.get<DailyQuiz>("/v1/daily-quizzes/:quizId", { path: { quizId } });
  }

  selectDailyQuiz(quizId: string, body?: DailyQuizSelectionRequest): Promise<ApiResult<DailyQuiz>> {
    return this.client.post<DailyQuiz, DailyQuizSelectionRequest | undefined>("/v1/daily-quizzes/:quizId/selection", body, { path: { quizId } });
  }

  claimDailyQuizReward(quizId: string): Promise<ApiResult<DailyQuizRewardResponse>> {
    return this.client.post<DailyQuizRewardResponse>("/v1/daily-quizzes/:quizId/claim-reward", undefined, { path: { quizId } });
  }

  listDailyQuizWinners(query?: CursorListQuery): Promise<ApiResult<DailyQuizWinnersResponse>> {
    return this.client.get<DailyQuizWinnersResponse>("/v1/daily-quizzes/winners", { query });
  }

  /** @deprecated Not observed in the 3.51.94 snapshot; retained for older clients. Use client.api for current contracts. */
  listChatMessageReportCategories(): Promise<ApiResult<ChatMessageReportCategoriesResponse>> {
    return this.client.get<ChatMessageReportCategoriesResponse>("/v1/chat-message-report-categories");
  }

  /** @deprecated Not observed in the 3.51.94 snapshot; retained for older clients. Use client.api for current contracts. */
  listChatModelConfigs(query?: ChatModelConfigQuery): Promise<ApiResult<ChatModelConfigsResponse>> {
    return this.client.get<ChatModelConfigsResponse>("/v1/chat-model-configs", { query });
  }

  migrateNutty(body?: NuttyMigrationRequest): Promise<ApiResult<NuttyUser>> {
    return this.client.post<NuttyUser, NuttyMigrationRequest | undefined>("/v1/nutty/migrate", body);
  }

  verifyNuttySms(body?: NuttyTokenVerificationRequest): Promise<ApiResult<NuttyUser>> {
    return this.client.post<NuttyUser, NuttyTokenVerificationRequest | undefined>("/v1/nutty/sms/verify", body);
  }

  verifyNuttyToken(body?: NuttyTokenVerificationRequest): Promise<ApiResult<NuttyUser>> {
    return this.client.post<NuttyUser, NuttyTokenVerificationRequest | undefined>("/v1/nutty/token/verify", body);
  }

  getNuttyUser(): Promise<ApiResult<NuttyUser>> {
    return this.client.get<NuttyUser>("/v1/nutty/user");
  }

  /** @deprecated Not observed in the 3.51.94 snapshot; retained for older clients. Use client.api for current contracts. */
  requestWithdrawal(body?: WithdrawalRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/withdrawal-requests", body);
  }

  /** @deprecated Not observed in the 3.51.94 snapshot; retained for older clients. Use client.api for current contracts. */
  searchZLabsPlots(query?: FeatureDiscoveryQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/zlabs/plots", { query });
  }

  /** @deprecated Not observed in the 3.51.94 snapshot; retained for older clients. Use client.api for current contracts. */
  getZLabsRelatedUsers(plotId: string, query?: CursorListQuery): Promise<ApiResult<{ [key: string]: unknown; users?: User[]; }>> {
    return this.client.get<{ users?: User[]; [key: string]: unknown }>("/v1/zlabs/plots/:plotId/related-users", { path: { plotId }, query });
  }

  /** @deprecated Not observed in the 3.51.94 snapshot; retained for older clients. Use client.api for current contracts. */
  getRandomZLabsPopularPlots(query?: FeatureDiscoveryQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/zlabs/popular-plots/random", { query });
  }

  /** @deprecated Not observed in the 3.51.94 snapshot; retained for older clients. Use client.api for current contracts. */
  getZLabsRecentPlays(query?: FeatureDiscoveryQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/zlabs/recent-plays", { query });
  }

  generateBackstories(body?: CreatorAssistantGenerateRequest): Promise<ApiResult<SnapshotDto<"CreatorAssistantGenerateBackstoriesResponse">>> {
    return this.client.post<SnapshotDto<"CreatorAssistantGenerateBackstoriesResponse">, CreatorAssistantGenerateRequest | undefined>("/v2/creator-assistant/generate-backstories", body);
  }

  generateCharacterImageByCoin(body?: CreatorAssistantGenerateRequest): Promise<ApiResult<SnapshotDto<"CreatorAssistantGenerateCharacterImageResponse">>> {
    return this.client.post<SnapshotDto<"CreatorAssistantGenerateCharacterImageResponse">, CreatorAssistantGenerateRequest | undefined>("/v2/creator-assistant/generate-character-image/by-coin", body);
  }

  generateCharacters(body?: CreatorAssistantGenerateRequest): Promise<ApiResult<SnapshotDto<"CreatorAssistantGenerateCharactersResponse">>> {
    return this.client.post<SnapshotDto<"CreatorAssistantGenerateCharactersResponse">, CreatorAssistantGenerateRequest | undefined>("/v2/creator-assistant/generate-characters", body);
  }

  generatePlot(body?: CreatorAssistantGenerateRequest): Promise<ApiResult<SnapshotDto<"CreatorAssistantSubmitPlotJobResponse">>> {
    return this.client.post("/v2/creator-assistant/generate-plot", body);
  }

  generateSituation(body?: CreatorAssistantGenerateRequest): Promise<ApiResult<SnapshotDto<"CreatorAssistantGenerateSituationsResponse">>> {
    return this.client.post<SnapshotDto<"CreatorAssistantGenerateSituationsResponse">, CreatorAssistantGenerateRequest | undefined>("/v2/creator-assistant/generate-situations", body);
  }

  getCreatorAssistantQuotaUpdates(): Promise<ApiResult<SnapshotDto<"CreatorAssistantBriefQuotaResponse">>> {
    return this.client.get("/v2/creator-assistant/quota");
  }

  listCreatorAssistantVibes(query?: CreatorAssistantVibeQuery): Promise<ApiResult<SnapshotDto<"CreatorAssistantVibesResponse">>> {
    return this.client.get<SnapshotDto<"CreatorAssistantVibesResponse">>("/v2/creator-assistant/vibes", { query });
  }

  requestNiceAdditionalAuth(): Promise<ApiResult<NiceAdditionalAuthResponse>> {
    return this.client.post<NiceAdditionalAuthResponse>("/v2/additional-auth/nice");
  }

  validateNiceAdditionalAuth(query: NiceAdditionalAuthValidateRequest): Promise<ApiResult<unknown>> {
    return this.client.get("/v2/additional-auth/nice/validate", { query });
  }

  /** @deprecated Creation is POST /v1/rooms; v2 is the room-list endpoint. */
  createV2Room(body: RoomCreateRequest): Promise<ApiResult<Room>> {
    return this.client.talk.createRoom(body);
  }
}

export function createAppApi(client: BaseClient): AppApi {
  return new AppApi(client);
}
