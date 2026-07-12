import type { BaseClient } from "./core/client.ts";
import type { StreamEvent } from "./core/stream.ts";
import type { ApiResult } from "./core/types.ts";
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

  async refresh(): Promise<ApiResult<Room>> {
    const result = await this.api.getRoom(this.id);
    this.roomData = result.data;
    return result;
  }

  getSpeakerProfiles(): Promise<TalkSpeakerProfile[]> {
    return this.api.getSpeakerProfiles(this.id);
  }

  update(body?: RoomUpdateRequest): Promise<ApiResult<Room>> {
    return this.api.updateRoom(this.id, body);
  }

  delete(): Promise<ApiResult<unknown>> {
    return this.api.deleteRoom(this.id);
  }

  pin(): Promise<ApiResult<unknown>> {
    return this.api.pinRoom(this.id);
  }

  unpin(): Promise<ApiResult<unknown>> {
    return this.api.unpinRoom(this.id);
  }

  async clone(body?: RoomCloneRequest): Promise<Talk> {
    const result = await this.api.cloneRoom(this.id, body);
    return this.api.fromRoom(result.data);
  }

  getPlotId(): Promise<ApiResult<IdResponse>> {
    return this.api.getRoomPlotId(this.id);
  }

  listMessages(query?: MessageListQuery): Promise<ApiResult<MessageListResponse>> {
    return this.api.listMessages(this.id, query);
  }

  updateMessage(messageId: string, body?: MessageUpdateRequest): Promise<ApiResult<Message>> {
    return this.api.updateMessage(this.id, messageId, body);
  }

  deleteMessages(body?: DeleteRoomMessagesRequest): Promise<ApiResult<unknown>> {
    return this.api.deleteRoomMessages(this.id, body);
  }

  streamMessage<T = ChatStreamEvent>(body: ChatSendMessageRequest): Promise<AsyncGenerator<StreamEvent<T>, any, any>> {
    return this.api.streamMessage<T>(this.id, body);
  }

  sendTextMessage(text: string, extra?: Omit<ChatTextRequest, "type" | "text">): Promise<AsyncGenerator<StreamEvent<ChatStreamEvent>, any, any>> {
    return this.api.sendTextMessage(this.id, text, extra);
  }

  streamCandidate<T = ChatStreamEvent>(messageId: string, body?: ChatSendMessageRequest): Promise<AsyncGenerator<StreamEvent<T>, any, any>> {
    return this.api.streamCandidate<T>(this.id, messageId, body);
  }

  streamOptions<T = ChatStreamEvent>(body?: ChatOptionsStreamRequest): Promise<AsyncGenerator<StreamEvent<T>, any, any>> {
    return this.api.streamOptions<T>(this.id, body);
  }

  streamMoreOptions<T = ChatStreamEvent>(body?: ChatOptionsStreamRequest): Promise<AsyncGenerator<StreamEvent<T>, any, any>> {
    return this.api.streamMoreOptions<T>(this.id, body);
  }

  listCandidates(messageId: string, query?: CandidateListQuery): Promise<ApiResult<CandidateListResponse>> {
    return this.api.listCandidates(this.id, messageId, query);
  }

  selectOption(id: string, body?: ChatOptionSelectRequest): Promise<ApiResult<unknown>> {
    return this.api.selectOption(this.id, id, body);
  }

  getModelSetting(): Promise<ApiResult<ModelSetting>> {
    return this.api.getModelSetting(this.id);
  }

  updateModelSetting(body?: ModelSetting): Promise<ApiResult<ModelSetting>> {
    return this.api.updateModelSetting(this.id, body);
  }

  getIntroBeforeSelection(): Promise<ApiResult<RoomIntroBeforeSelectionResponse>> {
    return this.api.getIntroBeforeSelection(this.id);
  }

  createIntro(): Promise<ApiResult<RoomIntroResponse>> {
    return this.api.createIntro(this.id);
  }

  listBookmarks(query?: MessageListQuery): Promise<ApiResult<RoomBookmarkListResponse>> {
    return this.api.listBookmarks(this.id, query);
  }

  getBookmarkCount(): Promise<ApiResult<{ [key: string]: unknown; count?: number; }>> {
    return this.api.getBookmarkCount(this.id);
  }

  getBookmarkUsage(): Promise<ApiResult<RoomBookmarkUsageResponse>> {
    return this.api.getBookmarkUsage(this.id);
  }

  deleteBookmark(bookmarkId: string): Promise<ApiResult<unknown>> {
    return this.api.deleteBookmark(this.id, bookmarkId);
  }

  createRecommendedMessages(body?: RoomRecommendedMessagesRequest): Promise<ApiResult<unknown>> {
    return this.api.createRecommendedMessages(this.id, body);
  }

  markRecommendedMessagesPurchaseHandled(body?: RoomRecommendedMessagesRequest): Promise<ApiResult<unknown>> {
    return this.api.markRecommendedMessagesPurchaseHandled(this.id, body);
  }

  getCyoaEditSetting(): Promise<ApiResult<ModelSetting>> {
    return this.api.getCyoaEditSetting(this.id);
  }

  updateCyoaEditSetting(body?: ModelSetting): Promise<ApiResult<ModelSetting>> {
    return this.api.updateCyoaEditSetting(this.id, body);
  }

  getInfoBoxCharacterSetting(): Promise<ApiResult<ModelSetting>> {
    return this.api.getInfoBoxCharacterSetting(this.id);
  }

  updateInfoBoxCharacterSetting(body?: ModelSetting): Promise<ApiResult<ModelSetting>> {
    return this.api.updateInfoBoxCharacterSetting(this.id, body);
  }

  listUserPlotChatProfiles(query?: ChatProfileListQuery): Promise<ApiResult<UserPlotChatProfileListResponse>> {
    return this.api.listUserPlotChatProfiles(this.id, query);
  }

  createUserPlotChatProfile(body?: UserPlotChatProfileDraftRequest): Promise<ApiResult<UserPlotChatProfile>> {
    return this.api.createUserPlotChatProfile(this.id, body);
  }

  selectUserPlotChatProfile(id: string): Promise<ApiResult<UserPlotChatProfile>> {
    return this.api.selectUserPlotChatProfile(this.id, id);
  }

  getSelectedUserPlotChatProfile(): Promise<ApiResult<UserPlotChatProfile>> {
    return this.api.getSelectedUserPlotChatProfile(this.id);
  }

  getSelectedUserPlotChatProfileCharacterIds(): Promise<ApiResult<{ [key: string]: unknown; selectedCharacterIds?: string[]; }>> {
    return this.api.getSelectedUserPlotChatProfileCharacterIds(this.id);
  }

  getMyUserPlotChatProfile(): Promise<ApiResult<UserPlotChatProfile>> {
    return this.api.getMyUserPlotChatProfile(this.id);
  }

  updateMyUserPlotChatProfile(body?: UserPlotChatProfileDraftRequest): Promise<ApiResult<UserPlotChatProfile>> {
    return this.api.updateMyUserPlotChatProfile(this.id, body);
  }

  createAndSelectUserPlotChatProfile(body?: UserPlotChatProfileDraftRequest): Promise<ApiResult<UserPlotChatProfile>> {
    return this.api.createAndSelectUserPlotChatProfile(this.id, body);
  }

  selectUserChatProfile(id: string, body?: Omit<UserChatProfileSelectionRequest, "roomId">): Promise<ApiResult<void>> {
    return this.api.selectUserChatProfile(this.id, id, body);
  }

  getSelectedUserPersona(plotId: string | undefined = this.roomData?.plotId ?? this.roomData?.plot?.id ?? this.roomData?.plot?.plotId): Promise<ApiResult<UserPersona>> {
    if (!plotId) {
      throw new ApiError("Cannot get selected user persona because plotId is missing.", {
        code: "MissingPlotId",
        data: this.roomData,
      });
    }
    return this.api.getSelectedUserPersona(plotId, this.id);
  }

  save(body?: RoomSaveRequest): Promise<ApiResult<unknown>> {
    return this.api.saveRoom(this.id, body);
  }

  load(body?: RoomLoadRequest): Promise<ApiResult<Room>> {
    return this.api.loadRoom(this.id, body);
  }

  deleteSaved(): Promise<ApiResult<unknown>> {
    return this.api.deleteSavedRoom(this.id);
  }
}

export class TalkApi {
  constructor(private readonly client: BaseClient) {}

  fromRoom(room: Room): Talk {
    const id = room.id;
    if (typeof id !== "string" || id.length === 0) {
      throw new ApiError("Cannot create Talk because room.id is missing.", {
        code: "MissingRoomId",
        data: room,
      });
    }
    return new Talk(this, id, room);
  }

  fromId(roomId: string): Talk {
    return new Talk(this, roomId);
  }

  async create(body: RoomCreateRequest): Promise<Talk> {
    const result = await this.createRoom(body);
    return this.fromRoom(result.data);
  }

  listRooms(query?: RoomListQuery): Promise<ApiResult<RoomListResponse>> {
    return this.client.get<RoomListResponse>("/v1/rooms", { query });
  }

  createRoom(body: RoomCreateRequest): Promise<ApiResult<Room>> {
    return this.client.post<Room, RoomCreateRequest>("/v1/rooms", body);
  }

  getRoom(roomId: string): Promise<ApiResult<Room>> {
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

  updateRoom(roomId: string, body?: RoomUpdateRequest): Promise<ApiResult<Room>> {
    return this.client.put<Room, RoomUpdateRequest | undefined>("/v1/rooms/:roomId", body, { path: { roomId } });
  }

  deleteRoom(roomId: string): Promise<ApiResult<unknown>> {
    return this.client.delete("/v1/rooms/:roomId", { path: { roomId } });
  }

  pinRoom(roomId: string): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/rooms/:roomId/pin", undefined, { path: { roomId } });
  }

  unpinRoom(roomId: string): Promise<ApiResult<unknown>> {
    return this.client.delete("/v1/rooms/:roomId/pin", { path: { roomId } });
  }

  cloneRoom(roomId: string, body?: RoomCloneRequest): Promise<ApiResult<Room>> {
    return this.client.post<Room, RoomCloneRequest | undefined>("/v1/rooms/:roomId/clone", body, { path: { roomId } });
  }

  purgeRooms(body?: RoomPurgeRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/rooms/purge", body);
  }

  getRoomPlotId(roomId: string): Promise<ApiResult<IdResponse>> {
    return this.client.get<IdResponse>("/v1/rooms/:roomId/plot-id", { path: { roomId } });
  }

  getActiveRoomId(query?: ActiveRoomIdQuery): Promise<ApiResult<IdResponse>> {
    return this.client.get<IdResponse>("/v1/rooms/active-room-id", { query });
  }

  listMessages(roomId: string, query?: MessageListQuery): Promise<ApiResult<MessageListResponse>> {
    return this.client.get<MessageListResponse>("/v1/rooms/:roomId/messages", { path: { roomId }, query });
  }

  updateMessage(roomId: string, messageId: string, body?: MessageUpdateRequest): Promise<ApiResult<Message>> {
    return this.client.put<Message, MessageUpdateRequest | undefined>("/v1/rooms/:roomId/messages/:messageId", body, { path: { roomId, messageId } });
  }

  deleteRoomMessages(roomId: string, body?: DeleteRoomMessagesRequest): Promise<ApiResult<unknown>> {
    return this.client.request("DELETE", "/v1/rooms/:roomId/room-messages", { path: { roomId }, body });
  }

  streamMessage<T = ChatStreamEvent>(roomId: string, body: ChatSendMessageRequest): Promise<AsyncGenerator<StreamEvent<T>, any, any>> {
    return this.client.stream<T, ChatSendMessageRequest>("/v1/rooms/:roomId/messages/stream", body, { path: { roomId } });
  }

  sendTextMessage(roomId: string, text: string, extra?: Omit<ChatTextRequest, "type" | "text">): Promise<AsyncGenerator<StreamEvent<ChatStreamEvent>, any, any>> {
    return this.client.stream<ChatStreamEvent, ChatTextRequest>("/v1/rooms/:roomId/messages/stream", { ...extra, type: "TEXT", text }, { path: { roomId } });
  }

  streamCandidate<T = ChatStreamEvent>(roomId: string, messageId: string, body?: ChatSendMessageRequest): Promise<AsyncGenerator<StreamEvent<T>, any, any>> {
    return this.client.stream<T, ChatSendMessageRequest | undefined>("/v1/rooms/:roomId/messages/:messageId/candidates/stream", body, { path: { roomId, messageId } });
  }

  streamOptions<T = ChatStreamEvent>(roomId: string, body?: ChatOptionsStreamRequest): Promise<AsyncGenerator<StreamEvent<T>, any, any>> {
    return this.client.stream<T, ChatOptionsStreamRequest | undefined>("/v1/rooms/:roomId/options/stream", body, { path: { roomId } });
  }

  streamMoreOptions<T = ChatStreamEvent>(roomId: string, body?: ChatOptionsStreamRequest): Promise<AsyncGenerator<StreamEvent<T>, any, any>> {
    return this.client.stream<T, ChatOptionsStreamRequest | undefined>("/v1/rooms/:roomId/options/stream/more", body, { path: { roomId } });
  }

  listCandidates(roomId: string, messageId: string, query?: CandidateListQuery): Promise<ApiResult<CandidateListResponse>> {
    return this.client.get<CandidateListResponse>("/v1/rooms/:roomId/messages/:messageId/candidates", { path: { roomId, messageId }, query });
  }

  updateCandidate(roomId: string, messageId: string, candidateId: string, body?: CandidateUpdateRequest): Promise<ApiResult<unknown>> {
    return this.client.put("/v1/rooms/:roomId/messages/:messageId/candidates/:candidateId", body, { path: { roomId, messageId, candidateId } });
  }

  sendCandidateFeedback(roomId: string, messageId: string, candidateId: string, body?: CandidateFeedbackRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/rooms/:roomId/messages/:messageId/candidates/:candidateId/feedback", body, { path: { roomId, messageId, candidateId } });
  }

  sendCandidateFeedbackModal(roomId: string, messageId: string, candidateId: string, body?: CandidateFeedbackRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/rooms/:roomId/messages/:messageId/candidates/:candidateId/feedback-modal", body, { path: { roomId, messageId, candidateId } });
  }

  rateCandidateSnapshotImage(roomId: string, messageId: string, candidateId: string, snapshotImageId: string, body?: SnapshotImageReactionRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/rooms/:roomId/messages/:messageId/candidates/:candidateId/snapshot-images/:snapshotImageId/ratings", body, { path: { roomId, messageId, candidateId, snapshotImageId } });
  }

  sendCandidateSnapshotImageOpinion(roomId: string, messageId: string, candidateId: string, snapshotImageId: string, body?: SnapshotImageReactionRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/rooms/:roomId/messages/:messageId/candidates/:candidateId/snapshot-images/:snapshotImageId/opinion", body, { path: { roomId, messageId, candidateId, snapshotImageId } });
  }

  reportCandidateSnapshotImage(roomId: string, messageId: string, candidateId: string, snapshotImageId: string, body?: SnapshotImageReactionRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/rooms/:roomId/messages/:messageId/candidates/:candidateId/snapshot-images/:snapshotImageId/reports", body, { path: { roomId, messageId, candidateId, snapshotImageId } });
  }

  reportMessage(roomId: string, messageId: string, body?: CandidateFeedbackRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/rooms/:roomId/messages/:messageId/reports", body, { path: { roomId, messageId } });
  }

  selectOption(roomId: string, id: string, body?: ChatOptionSelectRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/rooms/:roomId/options/:id", body, { path: { roomId, id } });
  }

  getModelSetting(roomId: string): Promise<ApiResult<ModelSetting>> {
    return this.client.get<ModelSetting>("/v1/rooms/:roomId/model-setting", { path: { roomId } });
  }

  updateModelSetting(roomId: string, body?: ModelSetting): Promise<ApiResult<ModelSetting>> {
    return this.client.put<ModelSetting, ModelSetting | undefined>("/v1/rooms/:roomId/model-setting", body, { path: { roomId } });
  }

  getIntroBeforeSelection(roomId: string): Promise<ApiResult<RoomIntroBeforeSelectionResponse>> {
    return this.client.get<RoomIntroBeforeSelectionResponse>("/v1/rooms/:roomId/intros/before-selection", { path: { roomId } });
  }

  createIntro(roomId: string): Promise<ApiResult<RoomIntroResponse>> {
    return this.client.post<RoomIntroResponse>("/v1/rooms/:roomId/intros", undefined, { path: { roomId } });
  }

  listBookmarks(roomId: string, query?: MessageListQuery): Promise<ApiResult<RoomBookmarkListResponse>> {
    return this.client.get<RoomBookmarkListResponse>("/v1/rooms/:roomId/bookmarks", { path: { roomId }, query });
  }

  getBookmarkCount(roomId: string): Promise<ApiResult<{ [key: string]: unknown; count?: number; }>> {
    return this.client.get<{ count?: number; [key: string]: unknown }>("/v1/rooms/:roomId/bookmarks/count", { path: { roomId } });
  }

  getBookmarkUsage(roomId: string): Promise<ApiResult<RoomBookmarkUsageResponse>> {
    return this.client.get<RoomBookmarkUsageResponse>("/v1/rooms/:roomId/bookmarks/usage", { path: { roomId } });
  }

  deleteBookmark(roomId: string, bookmarkId: string): Promise<ApiResult<unknown>> {
    return this.client.delete("/v1/rooms/:roomId/bookmarks/:bookmarkId", { path: { roomId, bookmarkId } });
  }

  createRecommendedMessages(roomId: string, body?: RoomRecommendedMessagesRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/rooms/:roomId/recommended-messages/multi", body, { path: { roomId } });
  }

  markRecommendedMessagesPurchaseHandled(roomId: string, body?: RoomRecommendedMessagesRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/rooms/:roomId/recommended-messages/purchase-already-handled", body, { path: { roomId } });
  }

  getCyoaEditSetting(roomId: string): Promise<ApiResult<ModelSetting>> {
    return this.client.get<ModelSetting>("/v1/rooms/:roomId/settings/cyoa", { path: { roomId } });
  }

  updateCyoaEditSetting(roomId: string, body?: ModelSetting): Promise<ApiResult<ModelSetting>> {
    return this.client.put<ModelSetting, ModelSetting | undefined>("/v1/rooms/:roomId/settings/cyoa", body, { path: { roomId } });
  }

  getInfoBoxCharacterSetting(roomId: string): Promise<ApiResult<ModelSetting>> {
    return this.client.get<ModelSetting>("/v1/rooms/:roomId/settings/info-box", { path: { roomId } });
  }

  updateInfoBoxCharacterSetting(roomId: string, body?: ModelSetting): Promise<ApiResult<ModelSetting>> {
    return this.client.put<ModelSetting, ModelSetting | undefined>("/v1/rooms/:roomId/settings/info-box", body, { path: { roomId } });
  }

  listUserPlotChatProfiles(roomId: string, query?: ChatProfileListQuery): Promise<ApiResult<UserPlotChatProfileListResponse>> {
    return this.client.get<UserPlotChatProfileListResponse>("/v1/rooms/:roomId/user-plot-chat-profiles", { path: { roomId }, query });
  }

  createUserPlotChatProfile(roomId: string, body?: UserPlotChatProfileDraftRequest): Promise<ApiResult<UserPlotChatProfile>> {
    return this.client.post<UserPlotChatProfile, UserPlotChatProfileDraftRequest | undefined>("/v1/rooms/:roomId/user-plot-chat-profiles", body, { path: { roomId } });
  }

  selectUserPlotChatProfile(roomId: string, id: string): Promise<ApiResult<UserPlotChatProfile>> {
    return this.client.put<UserPlotChatProfile>("/v1/rooms/:roomId/user-plot-chat-profiles/:id/selected", undefined, { path: { roomId, id } });
  }

  getSelectedUserPlotChatProfile(roomId: string): Promise<ApiResult<UserPlotChatProfile>> {
    return this.client.get<UserPlotChatProfile>("/v1/rooms/:roomId/user-plot-chat-profiles/selected", { path: { roomId } });
  }

  getSelectedUserPlotChatProfileCharacterIds(roomId: string): Promise<ApiResult<{ [key: string]: unknown; selectedCharacterIds?: string[]; }>> {
    return this.client.get<{ selectedCharacterIds?: string[]; [key: string]: unknown }>("/v1/rooms/:roomId/user-plot-chat-profiles/selectedCharacterIds", { path: { roomId } });
  }

  getMyUserPlotChatProfile(roomId: string): Promise<ApiResult<UserPlotChatProfile>> {
    return this.client.get<UserPlotChatProfile>("/v1/rooms/:roomId/user-plot-chat-profiles/me", { path: { roomId } });
  }

  updateMyUserPlotChatProfile(roomId: string, body?: UserPlotChatProfileDraftRequest): Promise<ApiResult<UserPlotChatProfile>> {
    return this.client.patch<UserPlotChatProfile, UserPlotChatProfileDraftRequest | undefined>("/v1/rooms/:roomId/user-plot-chat-profiles/me", body, { path: { roomId } });
  }

  createAndSelectUserPlotChatProfile(roomId: string, body?: UserPlotChatProfileDraftRequest): Promise<ApiResult<UserPlotChatProfile>> {
    return this.client.post<UserPlotChatProfile, UserPlotChatProfileDraftRequest | undefined>("/v1/rooms/:roomId/user-plot-chat-profiles/selected", body, { path: { roomId } });
  }

  selectUserChatProfile(roomId: string, id: string, body?: Omit<UserChatProfileSelectionRequest, "roomId">): Promise<ApiResult<void>> {
    return this.client.put<void, UserChatProfileSelectionRequest>("/v1/user-chat-profiles/:id/selected", { ...body, roomId }, { path: { id } });
  }

  getSelectedUserPersona(plotId: string, roomId: string): Promise<ApiResult<UserPersona>> {
    return this.client.get<UserPersona>("/v1/plots/:plotId/rooms/:roomId/user-personas/selected", { path: { plotId, roomId } });
  }

  uploadUserPlotChatProfileImage(body: MultipartImageBody): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/user-plot-chat-profiles/images", body, { multipart: true });
  }

  saveRoom(roomId: string, body?: RoomSaveRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/rooms/:roomId/save", body, { path: { roomId } });
  }

  loadRoom(roomId: string, body?: RoomLoadRequest): Promise<ApiResult<Room>> {
    return this.client.post<Room, RoomLoadRequest | undefined>("/v1/rooms/:roomId/load", body, { path: { roomId } });
  }

  listSavedRooms(query?: RoomListQuery): Promise<ApiResult<RoomListResponse>> {
    return this.client.get<RoomListResponse>("/v1/rooms/saved", { query });
  }

  deleteSavedRoom(roomId: string): Promise<ApiResult<unknown>> {
    return this.client.delete("/v1/rooms/:roomId/saved", { path: { roomId } });
  }

  getSavedRoomStatus(plotId: string): Promise<ApiResult<SavedRoomStatusResponse>> {
    return this.client.get<SavedRoomStatusResponse>("/v1/rooms/plots/:plotId/saved-room-status", { path: { plotId } });
  }
}

export function createTalkApi(client: BaseClient): TalkApi {
  return new TalkApi(client);
}
