import type { BaseClient } from "./core/client.ts";
import type { ApiResult } from "./core/types.ts";
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
    return this.client.post("/v1/app-push/tokens", body);
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

  getNotification(notificationId: string): Promise<ApiResult<NotificationItem>> {
    return this.client.get<NotificationItem>("/v1/notifications/:notificationId", { path: { notificationId } });
  }

  getNotificationsLatestUpdatedAt(): Promise<ApiResult<LatestUpdatedAtResponse>> {
    return this.client.get<LatestUpdatedAtResponse>("/v1/notifications/latest-updated-at");
  }

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

  listChatMessageReportCategories(): Promise<ApiResult<ChatMessageReportCategoriesResponse>> {
    return this.client.get<ChatMessageReportCategoriesResponse>("/v1/chat-message-report-categories");
  }

  listChatModelConfigs(query?: ChatModelConfigQuery): Promise<ApiResult<ChatModelConfigsResponse>> {
    return this.client.get<ChatModelConfigsResponse>("/v1/chat-model-configs", { query });
  }

  migrateNutty(body?: NuttyMigrationRequest): Promise<ApiResult<NuttyUser>> {
    return this.client.post<NuttyUser, NuttyMigrationRequest | undefined>("/v1/nutty/migrate", body);
  }

  verifyNuttySms(body?: NuttyTokenVerificationRequest): Promise<ApiResult<NuttyUser>> {
    return this.client.post<NuttyUser, NuttyTokenVerificationRequest | undefined>("/v1/nutty/sms/verify-v1", body);
  }

  verifyNuttyToken(body?: NuttyTokenVerificationRequest): Promise<ApiResult<NuttyUser>> {
    return this.client.post<NuttyUser, NuttyTokenVerificationRequest | undefined>("/v1/nutty/token/verify", body);
  }

  getNuttyUser(): Promise<ApiResult<NuttyUser>> {
    return this.client.get<NuttyUser>("/v1/nutty/user");
  }

  requestWithdrawal(body?: WithdrawalRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/withdrawal-requests", body);
  }

  searchZLabsPlots(query?: FeatureDiscoveryQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/zlabs/plots", { query });
  }

  getZLabsRelatedUsers(plotId: string, query?: CursorListQuery): Promise<ApiResult<{ [key: string]: unknown; users?: User[]; }>> {
    return this.client.get<{ users?: User[]; [key: string]: unknown }>("/v1/zlabs/plots/:plotId/related-users", { path: { plotId }, query });
  }

  getRandomZLabsPopularPlots(query?: FeatureDiscoveryQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/zlabs/popular-plots/random", { query });
  }

  getZLabsRecentPlays(query?: FeatureDiscoveryQuery): Promise<ApiResult<PlotListResponse>> {
    return this.client.get<PlotListResponse>("/v1/zlabs/recent-plays", { query });
  }

  generateBackstories(body?: CreatorAssistantGenerateRequest): Promise<ApiResult<CreatorAssistantGeneratedTextResponse>> {
    return this.client.post<CreatorAssistantGeneratedTextResponse, CreatorAssistantGenerateRequest | undefined>("/v2/creator-assistant/generate-backstories", body);
  }

  generateCharacterImageByCoin(body?: CreatorAssistantGenerateRequest): Promise<ApiResult<CreatorAssistantGeneratedImageResponse>> {
    return this.client.post<CreatorAssistantGeneratedImageResponse, CreatorAssistantGenerateRequest | undefined>("/v2/creator-assistant/generate-character-image/by-coin", body);
  }

  generateCharacters(body?: CreatorAssistantGenerateRequest): Promise<ApiResult<CreatorAssistantGeneratedTextResponse>> {
    return this.client.post<CreatorAssistantGeneratedTextResponse, CreatorAssistantGenerateRequest | undefined>("/v2/creator-assistant/generate-characters", body);
  }

  generatePlot(body?: CreatorAssistantGenerateRequest): Promise<ApiResult<Plot>> {
    return this.client.post<Plot, CreatorAssistantGenerateRequest | undefined>("/v2/creator-assistant/generate-plot", body);
  }

  generateSituation(body?: CreatorAssistantGenerateRequest): Promise<ApiResult<CreatorAssistantGeneratedTextResponse>> {
    return this.client.post<CreatorAssistantGeneratedTextResponse, CreatorAssistantGenerateRequest | undefined>("/v2/creator-assistant/generate-situation", body);
  }

  getCreatorAssistantQuotaUpdates(): Promise<ApiResult<CreatorAssistantQuotaResponse>> {
    return this.client.get<CreatorAssistantQuotaResponse>("/v2/creator-assistant/quota_updates");
  }

  listCreatorAssistantVibes(query?: CreatorAssistantVibeQuery): Promise<ApiResult<CreatorAssistantVibesResponse>> {
    return this.client.get<CreatorAssistantVibesResponse>("/v2/creator-assistant/vibes", { query });
  }

  requestNiceAdditionalAuth(body?: NiceAdditionalAuthValidateRequest): Promise<ApiResult<NiceAdditionalAuthValidateResponse>> {
    return this.client.post<NiceAdditionalAuthValidateResponse, NiceAdditionalAuthValidateRequest | undefined>("/v2/additional-auth/nice/validate", body);
  }

  createV2Room(body?: RoomCreateRequest): Promise<ApiResult<Room>> {
    return this.client.post<Room, RoomCreateRequest | undefined>("/v2/rooms", body);
  }
}

export function createAppApi(client: BaseClient): AppApi {
  return new AppApi(client);
}
