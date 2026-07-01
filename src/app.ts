import type { BaseClient } from "./core/client.ts";
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

  getAbExperiment(experimentId: string, query?: AppExperimentQuery) {
    return this.client.get<AbExperiment>("/v1/ab-experiments/:experimentId", { path: { experimentId }, query });
  }

  registerPushToken(body?: AppPushTokenRequest) {
    return this.client.post("/v1/app-push/tokens", body);
  }

  getPushSetting(pushType: string) {
    return this.client.get<AppPushSetting>("/v1/app-push/settings/:pushType", { path: { pushType } });
  }

  updatePushSetting(pushType: string, body?: AppPushSetting) {
    return this.client.put<AppPushSetting, AppPushSetting | undefined>("/v1/app-push/settings/:pushType", body, { path: { pushType } });
  }

  listNotifications(query?: CursorListQuery) {
    return this.client.get<NotificationListResponse>("/v1/notifications", { query });
  }

  getNotification(notificationId: string) {
    return this.client.get<NotificationItem>("/v1/notifications/:notificationId", { path: { notificationId } });
  }

  getNotificationsLatestUpdatedAt() {
    return this.client.get<LatestUpdatedAtResponse>("/v1/notifications/latest-updated-at");
  }

  getDailyQuiz(quizId: string) {
    return this.client.get<DailyQuiz>("/v1/daily-quizzes/:quizId", { path: { quizId } });
  }

  selectDailyQuiz(quizId: string, body?: DailyQuizSelectionRequest) {
    return this.client.post<DailyQuiz, DailyQuizSelectionRequest | undefined>("/v1/daily-quizzes/:quizId/selection", body, { path: { quizId } });
  }

  claimDailyQuizReward(quizId: string) {
    return this.client.post<DailyQuizRewardResponse>("/v1/daily-quizzes/:quizId/claim-reward", undefined, { path: { quizId } });
  }

  listDailyQuizWinners(query?: CursorListQuery) {
    return this.client.get<DailyQuizWinnersResponse>("/v1/daily-quizzes/winners", { query });
  }

  listChatMessageReportCategories() {
    return this.client.get<ChatMessageReportCategoriesResponse>("/v1/chat-message-report-categories");
  }

  listChatModelConfigs(query?: ChatModelConfigQuery) {
    return this.client.get<ChatModelConfigsResponse>("/v1/chat-model-configs", { query });
  }

  migrateNutty(body?: NuttyMigrationRequest) {
    return this.client.post<NuttyUser, NuttyMigrationRequest | undefined>("/v1/nutty/migrate", body);
  }

  verifyNuttySms(body?: NuttyTokenVerificationRequest) {
    return this.client.post<NuttyUser, NuttyTokenVerificationRequest | undefined>("/v1/nutty/sms/verify-v1", body);
  }

  verifyNuttyToken(body?: NuttyTokenVerificationRequest) {
    return this.client.post<NuttyUser, NuttyTokenVerificationRequest | undefined>("/v1/nutty/token/verify", body);
  }

  getNuttyUser() {
    return this.client.get<NuttyUser>("/v1/nutty/user");
  }

  requestWithdrawal(body?: WithdrawalRequest) {
    return this.client.post("/v1/withdrawal-requests", body);
  }

  searchZLabsPlots(query?: FeatureDiscoveryQuery) {
    return this.client.get<PlotListResponse>("/v1/zlabs/plots", { query });
  }

  getZLabsRelatedUsers(plotId: string, query?: CursorListQuery) {
    return this.client.get<{ users?: User[]; [key: string]: unknown }>("/v1/zlabs/plots/:plotId/related-users", { path: { plotId }, query });
  }

  getRandomZLabsPopularPlots(query?: FeatureDiscoveryQuery) {
    return this.client.get<PlotListResponse>("/v1/zlabs/popular-plots/random", { query });
  }

  getZLabsRecentPlays(query?: FeatureDiscoveryQuery) {
    return this.client.get<PlotListResponse>("/v1/zlabs/recent-plays", { query });
  }

  generateBackstories(body?: CreatorAssistantGenerateRequest) {
    return this.client.post<CreatorAssistantGeneratedTextResponse, CreatorAssistantGenerateRequest | undefined>("/v2/creator-assistant/generate-backstories", body);
  }

  generateCharacterImageByCoin(body?: CreatorAssistantGenerateRequest) {
    return this.client.post<CreatorAssistantGeneratedImageResponse, CreatorAssistantGenerateRequest | undefined>("/v2/creator-assistant/generate-character-image/by-coin", body);
  }

  generateCharacters(body?: CreatorAssistantGenerateRequest) {
    return this.client.post<CreatorAssistantGeneratedTextResponse, CreatorAssistantGenerateRequest | undefined>("/v2/creator-assistant/generate-characters", body);
  }

  generatePlot(body?: CreatorAssistantGenerateRequest) {
    return this.client.post<Plot, CreatorAssistantGenerateRequest | undefined>("/v2/creator-assistant/generate-plot", body);
  }

  generateSituation(body?: CreatorAssistantGenerateRequest) {
    return this.client.post<CreatorAssistantGeneratedTextResponse, CreatorAssistantGenerateRequest | undefined>("/v2/creator-assistant/generate-situation", body);
  }

  getCreatorAssistantQuotaUpdates() {
    return this.client.get<CreatorAssistantQuotaResponse>("/v2/creator-assistant/quota_updates");
  }

  listCreatorAssistantVibes(query?: CreatorAssistantVibeQuery) {
    return this.client.get<CreatorAssistantVibesResponse>("/v2/creator-assistant/vibes", { query });
  }

  requestNiceAdditionalAuth(body?: NiceAdditionalAuthValidateRequest) {
    return this.client.post<NiceAdditionalAuthValidateResponse, NiceAdditionalAuthValidateRequest | undefined>("/v2/additional-auth/nice/validate", body);
  }

  createV2Room(body?: RoomCreateRequest) {
    return this.client.post<Room, RoomCreateRequest | undefined>("/v2/rooms", body);
  }
}

export function createAppApi(client: BaseClient): AppApi {
  return new AppApi(client);
}
