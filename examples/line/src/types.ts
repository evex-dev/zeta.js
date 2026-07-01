import type { webhook } from "@line/bot-sdk";

export type LineWebhookPayload = webhook.CallbackRequest
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
