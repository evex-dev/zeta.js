import type { ChatStreamEvent, Message, MessageContent, Plot, TalkSpeakerProfile } from "zeta.js";
import type { PlotPersona } from "./types.ts";

export type TextSegment = {
  text: string;
  speakerName?: string;
};

export function plotDisplayName(plot: Plot): string {
  return truncate(firstText(plot.title, plot.name) ?? "Zeta", 80);
}

export function plotPersona(plot: Plot): PlotPersona {
  const character = Array.isArray(plot.characters) ? plot.characters.find((item) => item?.name || item?.imageUrl) : undefined;
  const name = firstText(plot.title, plot.name, plot.firstCharacterName, character?.name) ?? "Zeta";
  const avatarUrl = firstText(plot.imageUrl, plot.initialRoomImageUrl, character?.imageUrl);

  return { name: truncate(name, 80), avatarUrl };
}

export function speakerProfilesFromApi(profiles: TalkSpeakerProfile[]): PlotPersona[] {
  return profiles
    .filter((profile) => profile.name?.trim())
    .map((profile) => ({
      name: truncate(profile.name, 80),
      avatarUrl: profile.imageUrl ?? undefined,
    }));
}

export function plotSummary(plot: Plot): string {
  return firstText(plot.shortDescription, plot.description, plot.longDescription) ?? "No description";
}

export function plotSearchDescription(plot: Plot): string {
  return firstText(plot.longDescription, plot.shortDescription, plot.description) ?? "No description";
}

export function messageToText(message: Message | null | undefined): string | undefined {
  return segmentsToText(messageToSegments(message));
}

export function messageToSegments(message: Message | null | undefined): TextSegment[] {
  if (!message) {
    return [];
  }

  const contents = contentsToSegments(message.contents);
  if (contents.length > 0) {
    return contents;
  }

  const text = firstText(message.text, message.content);
  return text ? [{ text }] : [];
}

export function streamEventToText(event: ChatStreamEvent): { complete: boolean; text?: string } {
  const parsed = streamEventToSegments(event);
  return { complete: parsed.complete, text: segmentsToText(parsed.segments) };
}

export function streamEventToSegments(event: ChatStreamEvent): { complete: boolean; segments: TextSegment[] } {
  const complete = event.event === "CHAT_COMPLETE" || event.event === "CANDIDATE_COMPLETE";
  const replySegments = messageToSegments(event.replyMessage);
  if (replySegments.length > 0) {
    return { complete, segments: replySegments };
  }

  const chunkSegments = contentsToSegments(event.chunkMessage?.contents);
  if (chunkSegments.length > 0) {
    return { complete, segments: chunkSegments };
  }

  const text = typeof event.message === "string" && event.event !== "ERROR" ? event.message.trim() : "";
  return { complete, segments: text ? [{ text }] : [] };
}

export function resolveSpeakerPersona(speakerName: string | undefined, profiles: PlotPersona[] | undefined, fallback: PlotPersona): PlotPersona {
  if (speakerName === "__--profileName__") return { name: "(あなた)" }
  const trimmed = speakerName?.trim();
  if (!trimmed) {
    return fallback;
  }

  const exact = profiles?.find((profile) => profile.name === trimmed);
  return exact ?? { name: truncate(trimmed, 80), avatarUrl: fallback.avatarUrl };
}

export function segmentsToText(segments: TextSegment[]): string | undefined {
  const text = segments.map((segment) => segment.text).filter(Boolean).join("\n").trim();
  return text || undefined;
}

export function stripBotMentions(content: string, botId: string): string {
  const pattern = new RegExp(`<@!?${escapeRegExp(botId)}>`, "g");
  return content.replace(pattern, "").replace(/\s+/g, " ").trim();
}

export function replaceDiscordUserMentions(content: string, resolveDisplayName: (userId: string) => string | undefined): string {
  return content.replaceAll(/<@!?(\d+)>/g, (mention, userId: string) => {
    const displayName = resolveDisplayName(userId);
    return displayName ? `@${displayName}` : mention;
  });
}

export function replaceProfileNamePlaceholder(content: string, displayName: string): string {
  return content.replaceAll("__--profileName__", displayName);
}

export function firstText(...values: Array<string | null | undefined>): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return undefined;
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}

function contentsToSegments(contents: MessageContent[] | undefined): TextSegment[] {
  if (!Array.isArray(contents)) {
    return [];
  }

  return contents.flatMap((content) => {
    const text = content.text?.trim();
    return text ? [{ text, speakerName: content.speakerName }] : [];
  });
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
