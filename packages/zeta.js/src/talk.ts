import type { BaseClient } from "./core/client.ts";
import { ApiError } from "./core/types.ts";
import type {
  ActiveRoomIdQuery,
  CandidateFeedbackRequest,
  CandidateListQuery,
  CandidateListResponse,
  CandidateUpdateRequest,
  ChatProfileListQuery,
  ChatOptionsStreamRequest,
  ChatOptionSelectRequest,
  ChatSendMessageRequest,
  ChatStreamEvent,
  ChatTextRequest,
  DeleteRoomMessagesRequest,
  IdResponse,
  Message,
  MessageListQuery,
  MessageListResponse,
  MessageUpdateRequest,
  ModelSetting,
  MultipartImageBody,
  Room,
  RoomBookmarkListResponse,
  RoomBookmarkUsageResponse,
  RoomCloneRequest,
  RoomCreateRequest,
  RoomIntroBeforeSelectionResponse,
  RoomIntroResponse,
  RoomListQuery,
  RoomListResponse,
  RoomLoadRequest,
  RoomPurgeRequest,
  RoomRecommendedMessagesRequest,
  RoomSaveRequest,
  RoomUpdateRequest,
  SavedRoomStatusResponse,
  SnapshotImageReactionRequest,
  TalkSpeakerProfile,
  UserChatProfileSelectionRequest,
  UserPersona,
  UserPlotChatProfile,
  UserPlotChatProfileDraftRequest,
  UserPlotChatProfileListResponse,
} from "./domainTypes.ts";

export class Talk {
  private roomData?: Room;

  constructor(private readonly api: TalkApi, readonly id: string, room?: Room) {
    this.roomData = room;
  }

  get data(): Room | undefined {
    return this.roomData;
  }

  async refresh() {
    const result = await this.api.getRoom(this.id);
    this.roomData = result.data;
    return result;
  }

  getSpeakerProfiles() {
    return this.api.getSpeakerProfiles(this.id);
  }

  update(body?: RoomUpdateRequest) {
    return this.api.updateRoom(this.id, body);
  }

  delete() {
    return this.api.deleteRoom(this.id);
  }

  pin() {
    return this.api.pinRoom(this.id);
  }

  unpin() {
    return this.api.unpinRoom(this.id);
  }

  async clone(body?: RoomCloneRequest): Promise<Talk> {
    const result = await this.api.cloneRoom(this.id, body);
    return this.api.fromRoom(result.data);
  }

  getPlotId() {
    return this.api.getRoomPlotId(this.id);
  }

  listMessages(query?: MessageListQuery) {
    return this.api.listMessages(this.id, query);
  }

  updateMessage(messageId: string, body?: MessageUpdateRequest) {
    return this.api.updateMessage(this.id, messageId, body);
  }

  deleteMessages(body?: DeleteRoomMessagesRequest) {
    return this.api.deleteRoomMessages(this.id, body);
  }

  streamMessage<T = ChatStreamEvent>(body: ChatSendMessageRequest) {
    return this.api.streamMessage<T>(this.id, body);
  }

  sendTextMessage(text: string, extra?: Omit<ChatTextRequest, "type" | "text">) {
    return this.api.sendTextMessage(this.id, text, extra);
  }

  streamCandidate<T = ChatStreamEvent>(messageId: string, body?: ChatSendMessageRequest) {
    return this.api.streamCandidate<T>(this.id, messageId, body);
  }

  streamOptions<T = ChatStreamEvent>(body?: ChatOptionsStreamRequest) {
    return this.api.streamOptions<T>(this.id, body);
  }

  streamMoreOptions<T = ChatStreamEvent>(body?: ChatOptionsStreamRequest) {
    return this.api.streamMoreOptions<T>(this.id, body);
  }

  listCandidates(messageId: string, query?: CandidateListQuery) {
    return this.api.listCandidates(this.id, messageId, query);
  }

  selectOption(id: string, body?: ChatOptionSelectRequest) {
    return this.api.selectOption(this.id, id, body);
  }

  getModelSetting() {
    return this.api.getModelSetting(this.id);
  }

  updateModelSetting(body?: ModelSetting) {
    return this.api.updateModelSetting(this.id, body);
  }

  getIntroBeforeSelection() {
    return this.api.getIntroBeforeSelection(this.id);
  }

  createIntro() {
    return this.api.createIntro(this.id);
  }

  listBookmarks(query?: MessageListQuery) {
    return this.api.listBookmarks(this.id, query);
  }

  getBookmarkCount() {
    return this.api.getBookmarkCount(this.id);
  }

  getBookmarkUsage() {
    return this.api.getBookmarkUsage(this.id);
  }

  deleteBookmark(bookmarkId: string) {
    return this.api.deleteBookmark(this.id, bookmarkId);
  }

  createRecommendedMessages(body?: RoomRecommendedMessagesRequest) {
    return this.api.createRecommendedMessages(this.id, body);
  }

  markRecommendedMessagesPurchaseHandled(body?: RoomRecommendedMessagesRequest) {
    return this.api.markRecommendedMessagesPurchaseHandled(this.id, body);
  }

  getCyoaEditSetting() {
    return this.api.getCyoaEditSetting(this.id);
  }

  updateCyoaEditSetting(body?: ModelSetting) {
    return this.api.updateCyoaEditSetting(this.id, body);
  }

  getInfoBoxCharacterSetting() {
    return this.api.getInfoBoxCharacterSetting(this.id);
  }

  updateInfoBoxCharacterSetting(body?: ModelSetting) {
    return this.api.updateInfoBoxCharacterSetting(this.id, body);
  }

  listUserPlotChatProfiles(query?: ChatProfileListQuery) {
    return this.api.listUserPlotChatProfiles(this.id, query);
  }

  createUserPlotChatProfile(body?: UserPlotChatProfileDraftRequest) {
    return this.api.createUserPlotChatProfile(this.id, body);
  }

  selectUserPlotChatProfile(id: string) {
    return this.api.selectUserPlotChatProfile(this.id, id);
  }

  getSelectedUserPlotChatProfile() {
    return this.api.getSelectedUserPlotChatProfile(this.id);
  }

  getSelectedUserPlotChatProfileCharacterIds() {
    return this.api.getSelectedUserPlotChatProfileCharacterIds(this.id);
  }

  getMyUserPlotChatProfile() {
    return this.api.getMyUserPlotChatProfile(this.id);
  }

  updateMyUserPlotChatProfile(body?: UserPlotChatProfileDraftRequest) {
    return this.api.updateMyUserPlotChatProfile(this.id, body);
  }

  createAndSelectUserPlotChatProfile(body?: UserPlotChatProfileDraftRequest) {
    return this.api.createAndSelectUserPlotChatProfile(this.id, body);
  }

  selectUserChatProfile(id: string, body?: Omit<UserChatProfileSelectionRequest, "roomId">) {
    return this.api.selectUserChatProfile(this.id, id, body);
  }

  getSelectedUserPersona(plotId = this.roomData?.plotId ?? this.roomData?.plot?.id ?? this.roomData?.plot?.plotId) {
    if (!plotId) {
      throw new ApiError("Cannot get selected user persona because plotId is missing.", {
        code: "MissingPlotId",
        data: this.roomData,
      });
    }
    return this.api.getSelectedUserPersona(plotId, this.id);
  }

  save(body?: RoomSaveRequest) {
    return this.api.saveRoom(this.id, body);
  }

  load(body?: RoomLoadRequest) {
    return this.api.loadRoom(this.id, body);
  }

  deleteSaved() {
    return this.api.deleteSavedRoom(this.id);
  }
}

export class TalkApi {
  constructor(private readonly client: BaseClient) {}

  fromRoom(room: Room) {
    const id = room.id;
    if (typeof id !== "string" || id.length === 0) {
      throw new ApiError("Cannot create Talk because room.id is missing.", {
        code: "MissingRoomId",
        data: room,
      });
    }
    return new Talk(this, id, room);
  }

  fromId(roomId: string) {
    return new Talk(this, roomId);
  }

  async create(body: RoomCreateRequest): Promise<Talk> {
    const result = await this.createRoom(body);
    return this.fromRoom(result.data);
  }

  listRooms(query?: RoomListQuery) {
    return this.client.get<RoomListResponse>("/v1/rooms", { query });
  }

  createRoom(body: RoomCreateRequest) {
    return this.client.post<Room, RoomCreateRequest>("/v1/rooms", body);
  }

  getRoom(roomId: string) {
    return this.client.get<Room>("/v1/rooms/:roomId", { path: { roomId } });
  }

  async getSpeakerProfiles(roomId: string): Promise<TalkSpeakerProfile[]> {
    const room = await this.getRoom(roomId);
    const plot = room.data.plot;
    const speakers: TalkSpeakerProfile[] = [];
    const seenNames = new Set<string>();

    const addSpeaker = (speaker: TalkSpeakerProfile) => {
      const name = speaker.name.trim();
      if (!name || seenNames.has(name)) {
        return;
      }
      seenNames.add(name);
      speakers.push({ ...speaker, name });
    };

    for (const character of plot?.characters ?? []) {
      if (character.name) {
        addSpeaker({
          id: character.id,
          name: character.name,
          imageUrl: character.imageUrl,
          source: "character",
        });
      }
    }

    for (const chatProfile of plot?.chatProfiles ?? []) {
      if (chatProfile.name) {
        addSpeaker({
          id: chatProfile.id,
          name: chatProfile.name,
          imageUrl: chatProfile.imageUrl,
          source: "chatProfile",
        });
      }
    }

    const plotName = plot?.title ?? plot?.name ?? plot?.firstCharacterName;
    if (plotName) {
      addSpeaker({
        id: plot?.id ?? plot?.plotId,
        name: plotName,
        imageUrl: plot?.imageUrl ?? plot?.initialRoomImageUrl,
        source: "plot",
      });
    }

    return speakers;
  }

  updateRoom(roomId: string, body?: RoomUpdateRequest) {
    return this.client.put<Room, RoomUpdateRequest | undefined>("/v1/rooms/:roomId", body, { path: { roomId } });
  }

  deleteRoom(roomId: string) {
    return this.client.delete("/v1/rooms/:roomId", { path: { roomId } });
  }

  pinRoom(roomId: string) {
    return this.client.post("/v1/rooms/:roomId/pin", undefined, { path: { roomId } });
  }

  unpinRoom(roomId: string) {
    return this.client.delete("/v1/rooms/:roomId/pin", { path: { roomId } });
  }

  cloneRoom(roomId: string, body?: RoomCloneRequest) {
    return this.client.post<Room, RoomCloneRequest | undefined>("/v1/rooms/:roomId/clone", body, { path: { roomId } });
  }

  purgeRooms(body?: RoomPurgeRequest) {
    return this.client.post("/v1/rooms/purge", body);
  }

  getRoomPlotId(roomId: string) {
    return this.client.get<IdResponse>("/v1/rooms/:roomId/plot-id", { path: { roomId } });
  }

  getActiveRoomId(query?: ActiveRoomIdQuery) {
    return this.client.get<IdResponse>("/v1/rooms/active-room-id", { query });
  }

  listMessages(roomId: string, query?: MessageListQuery) {
    return this.client.get<MessageListResponse>("/v1/rooms/:roomId/messages", { path: { roomId }, query });
  }

  updateMessage(roomId: string, messageId: string, body?: MessageUpdateRequest) {
    return this.client.put<Message, MessageUpdateRequest | undefined>("/v1/rooms/:roomId/messages/:messageId", body, { path: { roomId, messageId } });
  }

  deleteRoomMessages(roomId: string, body?: DeleteRoomMessagesRequest) {
    return this.client.request("DELETE", "/v1/rooms/:roomId/room-messages", { path: { roomId }, body });
  }

  streamMessage<T = ChatStreamEvent>(roomId: string, body: ChatSendMessageRequest) {
    return this.client.stream<T, ChatSendMessageRequest>("/v1/rooms/:roomId/messages/stream", body, { path: { roomId } });
  }

  sendTextMessage(roomId: string, text: string, extra?: Omit<ChatTextRequest, "type" | "text">) {
    return this.client.stream<ChatStreamEvent, ChatTextRequest>("/v1/rooms/:roomId/messages/stream", { ...extra, type: "TEXT", text }, { path: { roomId } });
  }

  streamCandidate<T = ChatStreamEvent>(roomId: string, messageId: string, body?: ChatSendMessageRequest) {
    return this.client.stream<T, ChatSendMessageRequest | undefined>("/v1/rooms/:roomId/messages/:messageId/candidates/stream", body, { path: { roomId, messageId } });
  }

  streamOptions<T = ChatStreamEvent>(roomId: string, body?: ChatOptionsStreamRequest) {
    return this.client.stream<T, ChatOptionsStreamRequest | undefined>("/v1/rooms/:roomId/options/stream", body, { path: { roomId } });
  }

  streamMoreOptions<T = ChatStreamEvent>(roomId: string, body?: ChatOptionsStreamRequest) {
    return this.client.stream<T, ChatOptionsStreamRequest | undefined>("/v1/rooms/:roomId/options/stream/more", body, { path: { roomId } });
  }

  listCandidates(roomId: string, messageId: string, query?: CandidateListQuery) {
    return this.client.get<CandidateListResponse>("/v1/rooms/:roomId/messages/:messageId/candidates", { path: { roomId, messageId }, query });
  }

  updateCandidate(roomId: string, messageId: string, candidateId: string, body?: CandidateUpdateRequest) {
    return this.client.put("/v1/rooms/:roomId/messages/:messageId/candidates/:candidateId", body, { path: { roomId, messageId, candidateId } });
  }

  sendCandidateFeedback(roomId: string, messageId: string, candidateId: string, body?: CandidateFeedbackRequest) {
    return this.client.post("/v1/rooms/:roomId/messages/:messageId/candidates/:candidateId/feedback", body, { path: { roomId, messageId, candidateId } });
  }

  sendCandidateFeedbackModal(roomId: string, messageId: string, candidateId: string, body?: CandidateFeedbackRequest) {
    return this.client.post("/v1/rooms/:roomId/messages/:messageId/candidates/:candidateId/feedback-modal", body, { path: { roomId, messageId, candidateId } });
  }

  rateCandidateSnapshotImage(roomId: string, messageId: string, candidateId: string, snapshotImageId: string, body?: SnapshotImageReactionRequest) {
    return this.client.post("/v1/rooms/:roomId/messages/:messageId/candidates/:candidateId/snapshot-images/:snapshotImageId/ratings", body, { path: { roomId, messageId, candidateId, snapshotImageId } });
  }

  sendCandidateSnapshotImageOpinion(roomId: string, messageId: string, candidateId: string, snapshotImageId: string, body?: SnapshotImageReactionRequest) {
    return this.client.post("/v1/rooms/:roomId/messages/:messageId/candidates/:candidateId/snapshot-images/:snapshotImageId/opinion", body, { path: { roomId, messageId, candidateId, snapshotImageId } });
  }

  reportCandidateSnapshotImage(roomId: string, messageId: string, candidateId: string, snapshotImageId: string, body?: SnapshotImageReactionRequest) {
    return this.client.post("/v1/rooms/:roomId/messages/:messageId/candidates/:candidateId/snapshot-images/:snapshotImageId/reports", body, { path: { roomId, messageId, candidateId, snapshotImageId } });
  }

  reportMessage(roomId: string, messageId: string, body?: CandidateFeedbackRequest) {
    return this.client.post("/v1/rooms/:roomId/messages/:messageId/reports", body, { path: { roomId, messageId } });
  }

  selectOption(roomId: string, id: string, body?: ChatOptionSelectRequest) {
    return this.client.post("/v1/rooms/:roomId/options/:id", body, { path: { roomId, id } });
  }

  getModelSetting(roomId: string) {
    return this.client.get<ModelSetting>("/v1/rooms/:roomId/model-setting", { path: { roomId } });
  }

  updateModelSetting(roomId: string, body?: ModelSetting) {
    return this.client.put<ModelSetting, ModelSetting | undefined>("/v1/rooms/:roomId/model-setting", body, { path: { roomId } });
  }

  getIntroBeforeSelection(roomId: string) {
    return this.client.get<RoomIntroBeforeSelectionResponse>("/v1/rooms/:roomId/intros/before-selection", { path: { roomId } });
  }

  createIntro(roomId: string) {
    return this.client.post<RoomIntroResponse>("/v1/rooms/:roomId/intros", undefined, { path: { roomId } });
  }

  listBookmarks(roomId: string, query?: MessageListQuery) {
    return this.client.get<RoomBookmarkListResponse>("/v1/rooms/:roomId/bookmarks", { path: { roomId }, query });
  }

  getBookmarkCount(roomId: string) {
    return this.client.get<{ count?: number; [key: string]: unknown }>("/v1/rooms/:roomId/bookmarks/count", { path: { roomId } });
  }

  getBookmarkUsage(roomId: string) {
    return this.client.get<RoomBookmarkUsageResponse>("/v1/rooms/:roomId/bookmarks/usage", { path: { roomId } });
  }

  deleteBookmark(roomId: string, bookmarkId: string) {
    return this.client.delete("/v1/rooms/:roomId/bookmarks/:bookmarkId", { path: { roomId, bookmarkId } });
  }

  createRecommendedMessages(roomId: string, body?: RoomRecommendedMessagesRequest) {
    return this.client.post("/v1/rooms/:roomId/recommended-messages/multi", body, { path: { roomId } });
  }

  markRecommendedMessagesPurchaseHandled(roomId: string, body?: RoomRecommendedMessagesRequest) {
    return this.client.post("/v1/rooms/:roomId/recommended-messages/purchase-already-handled", body, { path: { roomId } });
  }

  getCyoaEditSetting(roomId: string) {
    return this.client.get<ModelSetting>("/v1/rooms/:roomId/settings/cyoa", { path: { roomId } });
  }

  updateCyoaEditSetting(roomId: string, body?: ModelSetting) {
    return this.client.put<ModelSetting, ModelSetting | undefined>("/v1/rooms/:roomId/settings/cyoa", body, { path: { roomId } });
  }

  getInfoBoxCharacterSetting(roomId: string) {
    return this.client.get<ModelSetting>("/v1/rooms/:roomId/settings/info-box", { path: { roomId } });
  }

  updateInfoBoxCharacterSetting(roomId: string, body?: ModelSetting) {
    return this.client.put<ModelSetting, ModelSetting | undefined>("/v1/rooms/:roomId/settings/info-box", body, { path: { roomId } });
  }

  listUserPlotChatProfiles(roomId: string, query?: ChatProfileListQuery) {
    return this.client.get<UserPlotChatProfileListResponse>("/v1/rooms/:roomId/user-plot-chat-profiles", { path: { roomId }, query });
  }

  createUserPlotChatProfile(roomId: string, body?: UserPlotChatProfileDraftRequest) {
    return this.client.post<UserPlotChatProfile, UserPlotChatProfileDraftRequest | undefined>("/v1/rooms/:roomId/user-plot-chat-profiles", body, { path: { roomId } });
  }

  selectUserPlotChatProfile(roomId: string, id: string) {
    return this.client.put<UserPlotChatProfile>("/v1/rooms/:roomId/user-plot-chat-profiles/:id/selected", undefined, { path: { roomId, id } });
  }

  getSelectedUserPlotChatProfile(roomId: string) {
    return this.client.get<UserPlotChatProfile>("/v1/rooms/:roomId/user-plot-chat-profiles/selected", { path: { roomId } });
  }

  getSelectedUserPlotChatProfileCharacterIds(roomId: string) {
    return this.client.get<{ selectedCharacterIds?: string[]; [key: string]: unknown }>("/v1/rooms/:roomId/user-plot-chat-profiles/selectedCharacterIds", { path: { roomId } });
  }

  getMyUserPlotChatProfile(roomId: string) {
    return this.client.get<UserPlotChatProfile>("/v1/rooms/:roomId/user-plot-chat-profiles/me", { path: { roomId } });
  }

  updateMyUserPlotChatProfile(roomId: string, body?: UserPlotChatProfileDraftRequest) {
    return this.client.patch<UserPlotChatProfile, UserPlotChatProfileDraftRequest | undefined>("/v1/rooms/:roomId/user-plot-chat-profiles/me", body, { path: { roomId } });
  }

  createAndSelectUserPlotChatProfile(roomId: string, body?: UserPlotChatProfileDraftRequest) {
    return this.client.post<UserPlotChatProfile, UserPlotChatProfileDraftRequest | undefined>("/v1/rooms/:roomId/user-plot-chat-profiles/selected", body, { path: { roomId } });
  }

  selectUserChatProfile(roomId: string, id: string, body?: Omit<UserChatProfileSelectionRequest, "roomId">) {
    return this.client.put<void, UserChatProfileSelectionRequest>("/v1/user-chat-profiles/:id/selected", { ...body, roomId }, { path: { id } });
  }

  getSelectedUserPersona(plotId: string, roomId: string) {
    return this.client.get<UserPersona>("/v1/plots/:plotId/rooms/:roomId/user-personas/selected", { path: { plotId, roomId } });
  }

  uploadUserPlotChatProfileImage(body: MultipartImageBody) {
    return this.client.post("/v1/user-plot-chat-profiles/images", body, { multipart: true });
  }

  saveRoom(roomId: string, body?: RoomSaveRequest) {
    return this.client.post("/v1/rooms/:roomId/save", body, { path: { roomId } });
  }

  loadRoom(roomId: string, body?: RoomLoadRequest) {
    return this.client.post<Room, RoomLoadRequest | undefined>("/v1/rooms/:roomId/load", body, { path: { roomId } });
  }

  listSavedRooms(query?: RoomListQuery) {
    return this.client.get<RoomListResponse>("/v1/rooms/saved", { query });
  }

  deleteSavedRoom(roomId: string) {
    return this.client.delete("/v1/rooms/:roomId/saved", { path: { roomId } });
  }

  getSavedRoomStatus(plotId: string) {
    return this.client.get<SavedRoomStatusResponse>("/v1/rooms/plots/:plotId/saved-room-status", { path: { plotId } });
  }
}

export function createTalkApi(client: BaseClient): TalkApi {
  return new TalkApi(client);
}
