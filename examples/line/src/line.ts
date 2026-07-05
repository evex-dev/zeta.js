import { messagingApi } from "@line/bot-sdk";
import type { LineSource } from "./types.ts";

export type LineMessage = messagingApi.Message;
export type LineGroupSummary = messagingApi.GroupSummaryResponse;
export type LineProfile =
  | messagingApi.UserProfileResponse
  | messagingApi.GroupUserProfileResponse
  | messagingApi.RoomUserProfileResponse;

export class LineService {
  private readonly client: messagingApi.MessagingApiClient;

  constructor(channelAccessToken: string) {
    this.client = new messagingApi.MessagingApiClient({ channelAccessToken });
  }

  async replyMessage(
    replyToken: string,
    messages: LineMessage[],
  ): Promise<string[]> {
    if (messages.length === 0) return [];
    const response = await this.client.replyMessage({
      replyToken,
      messages: messages.slice(0, 5),
    });
    return response.sentMessages.map((message) => message.id);
  }

  async pushMessages(
    to: string | undefined,
    messages: LineMessage[],
  ): Promise<string[]> {
    if (!to || messages.length === 0) return [];
    const sentMessageIds: string[] = [];
    for (let index = 0; index < messages.length; index += 5) {
      const response = await this.client.pushMessage({
        to,
        messages: messages.slice(index, index + 5),
      });
      sentMessageIds.push(
        ...response.sentMessages.map((message) => message.id),
      );
    }
    return sentMessageIds;
  }

  async showLoadingAnimation(
    userId: string,
    loadingSeconds = 20,
  ): Promise<void> {
    await this.client.showLoadingAnimation({ chatId: userId, loadingSeconds });
  }

  async markAsRead(markAsReadToken: string | undefined): Promise<void> {
    if (!markAsReadToken) return;
    await this.client.markMessagesAsReadByToken({ markAsReadToken });
  }

  async getProfile(source: LineSource): Promise<LineProfile> {
    if (!("userId" in source) || !source.userId) {
      throw new Error("source.userId is required.");
    }

    if (source.type === "group") {
      return await this.client.getGroupMemberProfile(
        source.groupId,
        source.userId,
      );
    }

    if (source.type === "room") {
      return await this.client.getRoomMemberProfile(
        source.roomId,
        source.userId,
      );
    }

    return await this.client.getProfile(source.userId);
  }

  async getGroupSummary(groupId: string): Promise<LineGroupSummary> {
    return await this.client.getGroupSummary(groupId);
  }
}

export function conversationIdFromSource(
  source: LineSource | undefined,
): string | undefined {
  if (!source) return undefined;
  if (source.type === "user") return `user:${source.userId}`;
  if (source.type === "group") return `group:${source.groupId}`;
  if (source.type === "room") return `room:${source.roomId}`;
  return undefined;
}

export function toLineTo(source: LineSource | undefined): string | undefined {
  if (!source) return undefined;
  if (source.type === "user") return source.userId;
  if (source.type === "group") return source.groupId;
  if (source.type === "room") return source.roomId;
  return undefined;
}

export function conversationLabelFromSource(
  source: LineSource | undefined,
): string {
  if (source?.type === "user") return "1:1";
  if (source?.type === "group") return "group";
  if (source?.type === "room") return "room";
  return "conversation";
}
