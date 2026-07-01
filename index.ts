import { BaseClient, webClientOptions } from "./src/core/client.ts";
import type { ZetaClientOptions } from "./src/core/types.ts";
import type { LorebooksApi } from "./src/lorebooks.ts";
import type { PlotsApi } from "./src/plots.ts";
import type { ProfileApi } from "./src/profile.ts";
import type { TalkApi } from "./src/talk.ts";
import type {
  ChatProfileAbusingCheckRequest,
  ChatProfileDraftRequest,
  ChatProfileListQuery,
  LorebookDraftRequest,
  LorebookListQuery,
  MultipartImageBody,
  PlotDraftRequest,
  PlotListQuery,
  RoomCreateRequest,
  RoomListQuery,
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

  create(body: RoomCreateRequest) {
    return this.api.create(body);
  }

  fromId(roomId: string) {
    return this.api.fromId(roomId);
  }

  list(query?: RoomListQuery) {
    return this.api.listRooms(query);
  }

  listSaved(query?: RoomListQuery) {
    return this.api.listSavedRooms(query);
  }
}

export class PlotsCollection {
  constructor(private readonly api: PlotsApi) { }

  create(body?: PlotDraftRequest) {
    return this.api.create(body);
  }

  get(plotId: string) {
    return this.api.get(plotId);
  }

  fromId(plotId: string) {
    return this.api.fromId(plotId);
  }

  list(query?: PlotListQuery) {
    return this.api.listPlots(query);
  }

  listCreator(query?: PlotListQuery) {
    return this.api.listCreatorPlots(query);
  }

  listLiked(query?: PlotListQuery) {
    return this.api.listLikedPlots(query);
  }
}

export class LorebooksCollection {
  constructor(private readonly api: LorebooksApi) { }

  create(body?: LorebookDraftRequest) {
    return this.api.create(body);
  }

  get(lorebookId: string) {
    return this.api.get(lorebookId);
  }

  fromId(lorebookId: string) {
    return this.api.fromId(lorebookId);
  }

  list(query?: LorebookListQuery) {
    return this.api.listLorebooks(query);
  }

  listCreator(query?: LorebookListQuery) {
    return this.api.listCreatorLorebooks(query);
  }

  search(query?: LorebookListQuery) {
    return this.api.searchLorebooks(query);
  }
}

export class ChatProfilesCollection {
  constructor(private readonly api: ProfileApi) { }

  list(query?: ChatProfileListQuery) {
    return this.api.listChatProfiles(query);
  }

  create(body?: ChatProfileDraftRequest) {
    return this.api.chatProfiles.create(body);
  }

  get(id: string) {
    return this.api.chatProfiles.get(id);
  }

  fromId(id: string) {
    return this.api.chatProfile(id);
  }

  selected(query?: ChatProfileListQuery) {
    return this.api.chatProfiles.selected(query);
  }

  uploadImage(body: MultipartImageBody) {
    return this.api.uploadChatProfileImage(body);
  }

  checkAbusing(body?: ChatProfileAbusingCheckRequest) {
    return this.api.checkChatProfileAbusing(body);
  }
}

export class ProfileCollection {
  readonly chatProfiles: ChatProfilesCollection;

  constructor(private readonly api: ProfileApi) {
    this.chatProfiles = new ChatProfilesCollection(api);
  }

  me() {
    return this.api.me();
  }

  user(userId: string) {
    return this.api.user(userId);
  }

  uploadImage(body: MultipartImageBody) {
    return this.api.uploadProfileImage(body);
  }

  deleteImage() {
    return this.api.deleteProfileImage();
  }

  listBlockedUsers(query?: UserListQuery) {
    return this.api.listBlockedUsers(query);
  }

  getPreferredGenres() {
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

  refreshTokens(refreshToken = this.baseClient.refreshToken, deviceId = this.baseClient.session.deviceId) {
    return this.baseClient.refreshTokens(refreshToken, deviceId);
  }

  startAnonymousSession(deviceId = this.baseClient.session.deviceId) {
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
