import { BaseClient, webClientOptions } from "./src/core/client.ts";
import type { ApiResult, TokenPair, ZetaClientOptions } from "./src/core/types.ts";
import type { LorebookResource, LorebooksApi } from "./src/lorebooks.ts";
import type { PlotResource, PlotsApi } from "./src/plots.ts";
import type { ChatProfileResource, ChatProfilesResponse, ImageResponse, ProfileApi, UserResource } from "./src/profile.ts";
import type { Talk, TalkApi } from "./src/talk.ts";
import type {
  ChatProfileAbusingCheckRequest,
  ChatProfileDraftRequest,
  ChatProfileListQuery,
  LorebookDraftRequest,
  LorebookListResponse,
  LorebookListQuery,
  MultipartImageBody,
  PlotDraftRequest,
  PlotListResponse,
  PlotListQuery,
  RoomCreateRequest,
  RoomListResponse,
  RoomListQuery,
  UserChatProfileSelectionRequest,
  UserListResponse,
  UserListQuery,
} from "./src/domainTypes.ts";

export { BaseClient, DEFAULT_BASE_URL, interpolatePath, serializeQuery, webClientOptions } from "./src/core/client.ts";
export { ApiError } from "./src/core/types.ts";
export type * from "./src/core/types.ts";
export type * from "./src/core/stream.ts";
export type * from "./src/domainTypes.ts";
export type { ConnectedExternalPlatform, IssueTokenRequest, SsoCodeResponse, TokenResponse } from "./src/auth.ts";
export type { FollowState, CreatorDashboardSummary, CreatorStats } from "./src/creator.ts";
export type { ValidationResponse } from "./src/lorebooks.ts";
export type { CountResponse } from "./src/plots.ts";
export type { ChatProfilesResponse, ImageResponse, UsernameResponse } from "./src/profile.ts";
export type { GenreRanking, GenreRankingResponse } from "./src/ranking.ts";
export type { AutocompletePlotsResponse, HashtagTopic, HashtagTopicsResponse } from "./src/search.ts";
export { AnnouncementsApi } from "./src/announcements.ts";
export { AppApi } from "./src/app.ts";
export { AuthApi } from "./src/auth.ts";
export { CoinApi } from "./src/coin.ts";
export { CreatorApi } from "./src/creator.ts";
export { FeatureFlagsApi } from "./src/featureFlags.ts";
export { HomeApi } from "./src/home.ts";
export { LorebookResource, LorebooksApi } from "./src/lorebooks.ts";
export { PassApi } from "./src/pass.ts";
export { PlotResource, PlotsApi } from "./src/plots.ts";
export { ChatProfileResource, ChatProfilesApi, ProfileApi, UserResource } from "./src/profile.ts";
export { RankingApi } from "./src/ranking.ts";
export { SearchApi } from "./src/search.ts";
export { Talk, TalkApi } from "./src/talk.ts";

export class TalkCollection {
  constructor(private readonly api: TalkApi) { }

  create(body: RoomCreateRequest): Promise<Talk> {
    return this.api.create(body);
  }

  fromId(roomId: string): Talk {
    return this.api.fromId(roomId);
  }

  list(query?: RoomListQuery): Promise<ApiResult<RoomListResponse>> {
    return this.api.listRooms(query);
  }

  listSaved(query?: RoomListQuery): Promise<ApiResult<RoomListResponse>> {
    return this.api.listSavedRooms(query);
  }
}

export class PlotsCollection {
  constructor(private readonly api: PlotsApi) { }

  create(body?: PlotDraftRequest): Promise<PlotResource> {
    return this.api.create(body);
  }

  get(plotId: string): Promise<PlotResource> {
    return this.api.get(plotId);
  }

  fromId(plotId: string): PlotResource {
    return this.api.fromId(plotId);
  }

  list(query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.api.listPlots(query);
  }

  listCreator(query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.api.listCreatorPlots(query);
  }

  listLiked(query?: PlotListQuery): Promise<ApiResult<PlotListResponse>> {
    return this.api.listLikedPlots(query);
  }
}

export class LorebooksCollection {
  constructor(private readonly api: LorebooksApi) { }

  create(body?: LorebookDraftRequest): Promise<LorebookResource> {
    return this.api.create(body);
  }

  get(lorebookId: string): Promise<LorebookResource> {
    return this.api.get(lorebookId);
  }

  fromId(lorebookId: string): LorebookResource {
    return this.api.fromId(lorebookId);
  }

  list(query?: LorebookListQuery): Promise<ApiResult<LorebookListResponse>> {
    return this.api.listLorebooks(query);
  }

  listCreator(query?: LorebookListQuery): Promise<ApiResult<LorebookListResponse>> {
    return this.api.listCreatorLorebooks(query);
  }

  search(query?: LorebookListQuery): Promise<ApiResult<LorebookListResponse>> {
    return this.api.searchLorebooks(query);
  }
}

export class ChatProfilesCollection {
  constructor(private readonly api: ProfileApi) { }

  list(query?: ChatProfileListQuery): Promise<ApiResult<ChatProfilesResponse>> {
    return this.api.listChatProfiles(query);
  }

  create(body?: ChatProfileDraftRequest): Promise<ChatProfileResource> {
    return this.api.chatProfiles.create(body);
  }

  get(id: string): Promise<ChatProfileResource> {
    return this.api.chatProfiles.get(id);
  }

  fromId(id: string): ChatProfileResource {
    return this.api.chatProfile(id);
  }

  selected(query?: ChatProfileListQuery): Promise<ChatProfileResource> {
    return this.api.chatProfiles.selected(query);
  }

  select(id: string, body?: UserChatProfileSelectionRequest): Promise<ApiResult<void>> {
    return this.api.chatProfiles.select(id, body);
  }

  uploadImage(body: MultipartImageBody): Promise<ApiResult<ImageResponse>> {
    return this.api.uploadChatProfileImage(body);
  }

  checkAbusing(body?: ChatProfileAbusingCheckRequest): Promise<ApiResult<unknown>> {
    return this.api.checkChatProfileAbusing(body);
  }
}

export class ProfileCollection {
  readonly chatProfiles: ChatProfilesCollection;

  constructor(private readonly api: ProfileApi) {
    this.chatProfiles = new ChatProfilesCollection(api);
  }

  me(): Promise<UserResource> {
    return this.api.me();
  }

  user(userId: string): UserResource {
    return this.api.user(userId);
  }

  uploadImage(body: MultipartImageBody): Promise<ApiResult<ImageResponse>> {
    return this.api.uploadProfileImage(body);
  }

  deleteImage(): Promise<ApiResult<unknown>> {
    return this.api.deleteProfileImage();
  }

  listBlockedUsers(query?: UserListQuery): Promise<ApiResult<UserListResponse>> {
    return this.api.listBlockedUsers(query);
  }

  getPreferredGenres(): Promise<ApiResult<{ [key: string]: unknown; genres?: string[]; genreKeys?: string[]; }>> {
    return this.api.getPreferredGenres();
  }
}

export class ZetaClient {
  readonly baseClient: BaseClient;
  readonly talk: TalkCollection;
  readonly plots: PlotsCollection;
  readonly lorebooks: LorebooksCollection;
  readonly profile: ProfileCollection;

  readonly auth: BaseClient["auth"];
  readonly featureFlags: BaseClient["featureFlags"];
  readonly home: BaseClient["home"];
  readonly ranking: BaseClient["ranking"];
  readonly announcements: BaseClient["announcements"];
  readonly app: BaseClient["app"];
  readonly search: BaseClient["search"];
  readonly creator: BaseClient["creator"];
  readonly coin: BaseClient["coin"];
  readonly pass: BaseClient["pass"];

  constructor(options: ZetaClientOptions = {}) {
    this.baseClient = new BaseClient(options);
    this.talk = new TalkCollection(this.baseClient.talk);
    this.plots = new PlotsCollection(this.baseClient.plots);
    this.lorebooks = new LorebooksCollection(this.baseClient.lorebooks);
    this.profile = new ProfileCollection(this.baseClient.profile);

    this.auth = this.baseClient.auth;
    this.featureFlags = this.baseClient.featureFlags;
    this.home = this.baseClient.home;
    this.ranking = this.baseClient.ranking;
    this.announcements = this.baseClient.announcements;
    this.app = this.baseClient.app;
    this.search = this.baseClient.search;
    this.creator = this.baseClient.creator;
    this.coin = this.baseClient.coin;
    this.pass = this.baseClient.pass;
  }

  get token(): string | undefined {
    return this.baseClient.token;
  }

  get refreshToken(): string | undefined {
    return this.baseClient.refreshToken;
  }

  refreshTokens(refreshToken: string | undefined = this.baseClient.refreshToken, deviceId: string | undefined = this.baseClient.session.deviceId): Promise<TokenPair> {
    return this.baseClient.refreshTokens(refreshToken, deviceId);
  }

  startAnonymousSession(deviceId: string | undefined = this.baseClient.session.deviceId): Promise<TokenPair> {
    return this.baseClient.startAnonymousSession(deviceId);
  }
}

export type ZetaApiClient = ZetaClient;

export function createZetaClient(options: ZetaClientOptions = {}): ZetaApiClient {
  return new ZetaClient(options);
}

export async function createWebAnonymousClient(options: ZetaClientOptions = {}): Promise<ZetaApiClient> {
  const client = new ZetaClient(webClientOptions(options));
  await client.startAnonymousSession();
  return client;
}
