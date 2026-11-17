import type { JsonObject, JsonValue, UnknownRecord } from "./core/types.ts";
import type { Message, Candidate } from "./domainTypes.ts";
import type { SpeakerPosition } from "./generated/enums.ts";
import type { SnapshotDto } from "./generated/dtos.ts";

export type TextContent = UnknownRecord & {
  type: "TEXT";
  text: string;
  speakerName?: string;
  position?: SpeakerPosition;
};
export type TopicContent = UnknownRecord & { type: "TOPIC"; id?: string; title: string; body: string };
export type ImageContent = UnknownRecord & { type: "IMAGE"; id?: string; url: string; aspectRatio?: number };
export type InfoBoxItem = { label: string; value: string };
export type InfoBoxCharacter = { name: string; items: InfoBoxItem[] };
export type InfoBoxContent = UnknownRecord & { type: "INFO_BOX"; scenes: InfoBoxItem[]; characters: InfoBoxCharacter[] };
export type PluginContent = UnknownRecord & { type: "PLUGIN"; pluginId: string; data: JsonValue };
export type CyoaChoice = { title: string; text: string };
export type CyoaContent = UnknownRecord & { type: "CYOA"; choices: CyoaChoice[] };

/** Completed message contents. CYOA choices are separate on completed messages. */
export type MessageContent = TextContent | TopicContent | ImageContent | InfoBoxContent | PluginContent;
export type MessageChunkContent = MessageContent | CyoaContent;

export type ChatTextRequest = JsonObject & { type: "TEXT"; text: string };
/** The distributed client erased the non-discriminator fields of this input. */
export type ChatCyoaRequest = JsonObject & { type: "CYOA" };
export type ChatPluginRequest = JsonObject & { type: "PLUGIN"; pluginId?: string; content?: JsonValue };
export type ChatSendMessageRequest = ChatTextRequest | ChatCyoaRequest | ChatPluginRequest;

export type ChatStreamChunkMessage = { contents?: MessageChunkContent[] };
type ReplyOption = UnknownRecord & { contents?: MessageContent[] };
type StreamBase = UnknownRecord & {
  index?: number | null;
  message?: string;
  chunkMessage?: ChatStreamChunkMessage;
  requestMessage?: Message;
  replyMessage?: Message;
  candidate?: Candidate;
  replyOption?: ReplyOption;
  shouldNudgeSlowChat?: boolean;
  shouldGenerateConsecutive?: boolean;
  shouldRequestFeedback?: boolean;
  feedbackPredefinedComments?: unknown[];
};
export type CyoaStreamData = { status: "DETECTED" } | { status: "FAILED" }
  | { status: "COMPLETE"; choices: CyoaChoice[] };

/** Known events form a discriminated union; arbitrary raw SSE remains available. */
export type ChatStreamEvent =
  | (StreamBase & { event: "IN_PROGRESS"; chunkMessage: ChatStreamChunkMessage })
  | (StreamBase & { event: "CHAT_COMPLETE"; replyMessage: Message; requestMessage?: Message })
  | (StreamBase & { event: "CANDIDATE_COMPLETE"; candidate: Candidate; shouldShowInput?: boolean })
  | (StreamBase & { event: "EXAMPLE_CHAT_COMPLETE"; replyMessage: Message })
  | (StreamBase & { event: "CHAT_OPTION_COMPLETE"; replyOption: ReplyOption })
  | (StreamBase & { event: "RECOMMENDED_MESSAGE_COMPLETE"; replyMessage: Message })
  | (StreamBase & { event: "CHAT_INTERIM_COMPLETE" })
  | (StreamBase & { event: "AUTO_PAYMENT_CHARGED"; chargedAmount?: number })
  | (StreamBase & { event: "AUTO_PAYMENT_REQUESTED"; orderId: string; amount?: number })
  | (StreamBase & { event: "CHANGE_FACIAL" })
  | (StreamBase & { event: "CYOA"; data: CyoaStreamData })
  | (StreamBase & { event: "DETECT_ABUSING"; requestId?: string; penalty?: SnapshotDto<"ChatPenaltyNotice"> })
  | (StreamBase & { event: "ERROR" });

/** Opt in to this shape when consuming future events outside the saved contract. */
export type UnknownChatStreamEvent = UnknownRecord & { event: string; index?: number };
export type ChatStreamEventName = ChatStreamEvent["event"];

export type PluginSelection = { type: "ALL" } | { type: "IN"; ids: string[] } | { type: "NOT_IN"; ids: string[] };
export type ChatModelConfig = {
  id?: string;
  displayName?: string;
  displayImageUrl?: string;
  displayImageWidth?: number;
  displayImageHeight?: number;
  displayDescription?: string;
  coinProduct?: { id?: string; name?: string; price?: number; discountedPrice?: number; type?: string; durationDays?: number };
  config?: { plugins?: PluginSelection };
};
export type RoomModelSetting = { roomId?: string; chatModelConfig?: ChatModelConfig; features?: string[] };
/** Do not substitute sampling parameters for the server's erased update DTO. */
export type RoomModelSettingUpdateRequest = JsonObject;
