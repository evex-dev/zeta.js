import type { BaseClient } from "./core/client.ts";
import { ApiError } from "./core/types.ts";
import type {
  AnyData,
  ChatProfile,
  ChatProfileAbusingCheckRequest,
  ChatProfileDraftRequest,
  ChatProfileListQuery,
  MultipartImageBody,
  PreferredGenresRequest,
  ProfileUpdateRequest,
  ReportRequest,
  User,
  UserChatProfileSelectionRequest,
  UserBlockRequest,
  UserListQuery,
  UserListResponse,
  WithdrawalWarningResponse,
} from "./domainTypes.ts";

export type UsernameResponse = AnyData & {
  username?: string;
  available?: boolean;
  userId?: string;
};

export type ChatProfilesResponse = AnyData & {
  chatProfiles?: ChatProfile[];
  userChatProfiles?: ChatProfile[];
  profiles?: ChatProfile[];
  nextCursor?: string | null;
};

export type ImageResponse = AnyData & {
  id?: string;
  imageUrl?: string;
  url?: string;
};

export class UserResource {
  private userData?: User;

  constructor(private readonly api: ProfileApi, readonly id: string, user?: User) {
    this.userData = user;
  }

  get data(): User | undefined {
    return this.userData;
  }

  async refresh() {
    const result = this.id === "me" ? await this.api.getSelfProfile() : await this.api.getUser(this.id);
    this.userData = result.data;
    return result;
  }

  update(body?: ProfileUpdateRequest) {
    if (this.id !== "me") {
      throw new ApiError("Only the current user profile can be updated.", { code: "UnsupportedUserUpdate" });
    }
    return this.api.updateSelfProfile(body);
  }

  report(body?: ReportRequest) {
    return this.api.reportUser(this.id, body);
  }

  block() {
    return this.api.blockUser({ userId: this.id });
  }

  unblock() {
    return this.api.unblockUser({ userId: this.id });
  }
}

export class ChatProfileResource {
  private profileData?: ChatProfile;

  constructor(private readonly api: ProfileApi, readonly id: string, profile?: ChatProfile) {
    this.profileData = profile;
  }

  get data(): ChatProfile | undefined {
    return this.profileData;
  }

  async refresh() {
    const result = await this.api.getChatProfile(this.id);
    this.profileData = result.data;
    return result;
  }

  async update(body?: ChatProfileDraftRequest) {
    const result = await this.api.updateChatProfile(this.id, body);
    this.profileData = result.data;
    return result;
  }

  delete() {
    return this.api.deleteChatProfile(this.id);
  }

  setDefault() {
    return this.api.setDefaultChatProfile(this.id);
  }

  select(body?: UserChatProfileSelectionRequest) {
    return this.api.setSelectedChatProfile(this.id, body);
  }
}

export class ChatProfilesApi {
  constructor(private readonly api: ProfileApi) {}

  list(query?: ChatProfileListQuery) {
    return this.api.listChatProfiles(query);
  }

  async create(body?: ChatProfileDraftRequest): Promise<ChatProfileResource> {
    const result = await this.api.createChatProfile(body);
    return this.api.fromChatProfileData(result.data);
  }

  async get(id: string): Promise<ChatProfileResource> {
    const result = await this.api.getChatProfile(id);
    return this.api.fromChatProfileData(result.data);
  }

  fromId(id: string) {
    return this.api.chatProfile(id);
  }

  async selected(query?: ChatProfileListQuery): Promise<ChatProfileResource> {
    const result = await this.api.getSelectedChatProfile(query);
    return this.api.fromChatProfileData(result.data);
  }

  select(id: string, body?: UserChatProfileSelectionRequest) {
    return this.api.setSelectedChatProfile(id, body);
  }

  uploadImage(body: MultipartImageBody) {
    return this.api.uploadChatProfileImage(body);
  }

  checkAbusing(body?: ChatProfileAbusingCheckRequest) {
    return this.api.checkChatProfileAbusing(body);
  }
}

export class ProfileApi {
  readonly chatProfiles = new ChatProfilesApi(this);

  constructor(private readonly client: BaseClient) {}

  fromUserData(user: User) {
    const id = user.id;
    if (typeof id !== "string" || id.length === 0) {
      throw new ApiError("Cannot create UserResource because user.id is missing.", {
        code: "MissingUserId",
        data: user,
      });
    }
    return new UserResource(this, id, user);
  }

  user(userId: string) {
    return new UserResource(this, userId);
  }

  async me(): Promise<UserResource> {
    const result = await this.getSelfProfile();
    return new UserResource(this, "me", result.data);
  }

  chatProfile(id: string) {
    return new ChatProfileResource(this, id);
  }

  fromChatProfileData(profile: ChatProfile) {
    const id = profile.id;
    if (typeof id !== "string" || id.length === 0) {
      throw new ApiError("Cannot create ChatProfileResource because profile.id is missing.", {
        code: "MissingChatProfileId",
        data: profile,
      });
    }
    return new ChatProfileResource(this, id, profile);
  }

  getSelfProfile() {
    return this.client.get<User>("/v1/users/me");
  }

  updateSelfProfile(body?: ProfileUpdateRequest) {
    return this.client.patch<User, ProfileUpdateRequest | undefined>("/v1/users/me", body);
  }

  getUser(userId: string) {
    return this.client.get<User>("/v1/users/:userId", { path: { userId } });
  }

  reportUser(userId: string, body?: ReportRequest) {
    return this.client.post("/v1/users/:userId/report", body, { path: { userId } });
  }

  getUserIdByUsername(username: string) {
    return this.client.get<UsernameResponse>("/v1/users/get-id-by-username/:username", { path: { username } });
  }

  getUsername(username: string) {
    return this.client.get<UsernameResponse>("/v1/usernames/:username", { path: { username } });
  }

  getAwesomeUsername() {
    return this.client.get<UsernameResponse>("/v1/usernames/awesome");
  }

  listChatProfiles(query?: ChatProfileListQuery) {
    return this.client.get<ChatProfilesResponse>("/v1/user-chat-profiles", { query });
  }

  createChatProfile(body?: ChatProfileDraftRequest) {
    return this.client.post<ChatProfile, ChatProfileDraftRequest | undefined>("/v1/user-chat-profiles", body);
  }

  getChatProfile(id: string) {
    return this.client.get<ChatProfile>("/v1/user-chat-profiles/:id", { path: { id } });
  }

  updateChatProfile(id: string, body?: ChatProfileDraftRequest) {
    return this.client.patch<ChatProfile, ChatProfileDraftRequest | undefined>("/v1/user-chat-profiles/:id", body, { path: { id } });
  }

  deleteChatProfile(id: string) {
    return this.client.delete("/v1/user-chat-profiles/:id", { path: { id } });
  }

  setDefaultChatProfile(id: string) {
    return this.client.put("/v1/user-chat-profiles/:id/default", undefined, { path: { id } });
  }

  setSelectedChatProfile(id: string, body?: UserChatProfileSelectionRequest) {
    return this.client.put<void, UserChatProfileSelectionRequest | undefined>("/v1/user-chat-profiles/:id/selected", body, { path: { id } });
  }

  getSelectedChatProfile(query?: ChatProfileListQuery) {
    return this.client.get<ChatProfile>("/v1/user-chat-profiles/selected", { query });
  }

  uploadProfileImage(body: MultipartImageBody) {
    return this.client.put<ImageResponse, MultipartImageBody>("/v1/users/me/profile/images", body, { multipart: true });
  }

  deleteProfileImage() {
    return this.client.delete("/v1/users/me/profile/images");
  }

  uploadChatProfileImage(body: MultipartImageBody) {
    return this.client.post<ImageResponse, MultipartImageBody>("/v1/user-chat-profiles/images", body, { multipart: true });
  }

  checkChatProfileAbusing(body?: ChatProfileAbusingCheckRequest) {
    return this.client.post("/v1/user-chat-profiles/abusing", body);
  }

  listBlockedUsers(query?: UserListQuery) {
    return this.client.get<UserListResponse>("/v1/users/blocks", { query });
  }

  blockUser(body: UserBlockRequest) {
    return this.client.post("/v1/users/blocks", body);
  }

  unblockUser(body: UserBlockRequest) {
    return this.client.request("DELETE", "/v1/users/blocks", { body });
  }

  checkUser(query?: UserListQuery) {
    return this.client.get<User>("/v1/users/check", { query });
  }

  checkIsNative() {
    return this.client.get<{ isNative?: boolean; [key: string]: unknown }>("/v1/users/checkIsNative");
  }

  listAccountBlocks(query?: UserListQuery) {
    return this.client.get<UserListResponse>("/v1/users/me/account-blocks", { query });
  }

  getPreferredGenres() {
    return this.client.get<{ genres?: string[]; genreKeys?: string[]; [key: string]: unknown }>("/v1/users/me/preferred-genres");
  }

  updatePreferredGenres(body?: PreferredGenresRequest) {
    return this.client.put<{ genres?: string[]; genreKeys?: string[]; [key: string]: unknown }, PreferredGenresRequest | undefined>("/v1/users/me/preferred-genres", body);
  }

  shouldWarnOnWithdrawal() {
    return this.client.get<WithdrawalWarningResponse>("/v1/users/me/should-warn-on-withdrawal");
  }
}

export function createProfileApi(client: BaseClient): ProfileApi {
  return new ProfileApi(client);
}
