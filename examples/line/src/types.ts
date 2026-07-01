import type { webhook } from "@line/bot-sdk";

export type DurableObjectStateLike = {
  storage: {
    get<T>(key: string): Promise<T | undefined>;
    put<T>(key: string, value: T): Promise<void>;
  };
};

export type Env = {
  CHANNEL_SECRET: string;
  CHANNEL_ACCESS_TOKEN: string;
  ZETA_INIT_SECRET?: string;
  ZETA_ACCESS_TOKEN?: string;
  ZETA_REFRESH_TOKEN?: string;
  ZETA_DEVICE_ID?: string;
  ZETA_STATE: DurableObjectNamespace;
};

export type LineWebhookPayload = {
  destination?: string;
  events?: webhook.Event[];
};

export type LineEvent = webhook.Event;
export type LineSource = webhook.Source;
export type LineTextMessage = webhook.TextMessageContent;

export type ZetaTokens = {
  accessToken: string;
  refreshToken?: string;
  deviceId?: string;
  updatedAt: string;
};

export type ConversationBinding = {
  conversationId: string;
  talkId: string;
  plotId: string;
  plotName: string;
  avatarUrl?: string;
  speakerProfiles?: PlotPersona[];
  userChatProfileId?: string;
  userChatProfileName?: string;
  createdAt: string;
  updatedAt: string;
};

export type PlotPersona = {
  name: string;
  avatarUrl?: string;
};

export type TextSegment = {
  text: string;
  speakerName?: string;
};

export type ProcessPayload = {
  payload: LineWebhookPayload;
};

export type ZetaCredentialInput = {
  token?: string;
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
  device_id?: string;
  deviceId?: string;
};
