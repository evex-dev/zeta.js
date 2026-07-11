import type { ChatStreamEvent, Message, MessageContent, Plot } from "../../../index.ts";

export type TextSegment = {
  text: string;
  speakerName?: string;
};

export function plotIdOf(plot: Plot): string | undefined {
  return plot.id ?? plot.plotId;
}

export function plotName(plot: Plot): string {
  return firstText(plot.title, plot.name, plot.firstCharacterName, plot.characters?.[0]?.name) ?? "Untitled plot";
}

export function plotDescription(plot: Plot): string {
  return firstText(plot.shortDescription, plot.description, plot.longDescription) ?? "";
}

export function singleCharacterName(plot: Plot): string {
  return firstText(plot.characters?.[0]?.name, plot.firstCharacterName, plotName(plot)) ?? "Character";
}

export function hasExactlyOneCharacter(plot: Plot): boolean {
  const characters = Array.isArray(plot.characters)
    ? plot.characters.filter((character) => firstText(character.id, character.name, character.description, character.imageUrl))
    : [];
  return characters.length === 1;
}

export function messageToText(message: Message | null | undefined): string | undefined {
  return segmentsToText(messageToSegments(message));
}

export function messageToSegments(message: Message | null | undefined): TextSegment[] {
  if (!message) {
    return [];
  }

  const contentSegments = contentsToSegments(message.contents);
  if (contentSegments.length > 0) {
    return contentSegments;
  }

  const text = firstText(message.text, message.content);
  return text ? [{ text }] : [];
}

export function streamEventToText(event: ChatStreamEvent): { complete: boolean; text?: string; error?: string } {
  const complete = event.event === "CHAT_COMPLETE" || event.event === "CANDIDATE_COMPLETE";
  if (event.event === "ERROR") {
    return { complete: true, error: firstText(event.message, JSON.stringify(event)) };
  }

  const reply = messageToText(event.replyMessage);
  if (reply) {
    return { complete, text: reply };
  }

  const chunk = segmentsToText(contentsToSegments(event.chunkMessage?.contents));
  if (chunk) {
    return { complete, text: chunk };
  }

  const text = typeof event.message === "string" ? event.message.trim() : "";
  return { complete, text: text || undefined };
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
  return `${value.slice(0, Math.max(0, maxLength - 1))}...`;
}

function contentsToSegments(contents: MessageContent[] | undefined): TextSegment[] {
  if (!Array.isArray(contents)) {
    return [];
  }

  return contents.flatMap((content) => {
    const text = content.text?.trim();
    if (!text) {
      return [];
    }
    return [{ text, speakerName: content.speakerName }];
  });
}

function segmentsToText(segments: TextSegment[]): string | undefined {
  const text = segments
    .map((segment) => segment.speakerName ? `${segment.speakerName}: ${segment.text}` : segment.text)
    .filter(Boolean)
    .join("\n")
    .trim();
  return text || undefined;
}
