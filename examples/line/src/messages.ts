import { messagingApi } from "@line/bot-sdk";
import type {
  ChatStreamEvent,
  Message as ZetaMessage,
  Plot,
  TalkSpeakerProfile,
} from "@evex/zeta";
import type { ConversationBinding, PlotPersona, TextSegment } from "./types.ts";

export const MAX_LINE_MESSAGES = 5;
export const MAX_FLEX_CAROUSEL_BUBBLES = 12;
export const MAX_QUICK_REPLY = 13;

export function buildPlotCarouselMessage(
  conversationId: string,
  keyword: string,
  plots: Plot[],
  displayName: string,
  relatedKeywords: string[],
): messagingApi.FlexMessage {
  return {
    type: "flex",
    altText: `「${keyword}」の検索結果`,
    contents: {
      type: "carousel",
      contents: plots.map((plot) =>
        buildPlotBubble(conversationId, plot, displayName),
      ),
    },
    quickReply: {
      items: relatedKeywords.slice(0, MAX_QUICK_REPLY).map((related) => ({
        type: "action",
        action: {
          type: "message",
          label: `+${related}`,
          text: `${keyword} ${related}`,
        },
      })),
    },
  };
}

export function buildPlotInfoMessage(
  plot: Plot,
  displayName: string,
): messagingApi.FlexMessage {
  const title = plotDisplayName(plot);
  const description = replaceProfileNamePlaceholder(
    plotSearchDescription(plot),
    displayName,
  );
  const characters = (plot.characters ?? [])
    .map((character) => character.name?.trim())
    .filter((name): name is string => Boolean(name));
  const imageUrl = firstText(
    plot.imageUrl,
    plot.initialRoomImageUrl,
    plot.characters?.find((character) => character.imageUrl)?.imageUrl,
  );
  const contents: messagingApi.FlexComponent[] = [
    { type: "text", text: title, weight: "bold", size: "lg", wrap: true },
    {
      type: "text",
      text: truncate(description, 700),
      size: "sm",
      color: "#555555",
      margin: "md",
      wrap: true,
    },
  ];

  if (characters.length > 0) {
    contents.push({
      type: "box",
      layout: "vertical",
      margin: "lg",
      spacing: "xs",
      contents: [
        {
          type: "text",
          text: "キャラクター",
          weight: "bold",
          size: "sm",
          color: "#333333",
        },
        {
          type: "text",
          text: truncate(characters.join("、"), 500),
          size: "sm",
          color: "#666666",
          wrap: true,
        },
      ],
    });
  }

  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents,
    },
  };

  if (imageUrl?.startsWith("https://")) {
    bubble.hero = {
      type: "image",
      url: imageUrl,
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
    };
  }

  return {
    type: "flex",
    altText: `${title} の情報`,
    contents: bubble,
    quickReply: unlinkQuickReply(),
  };
}

export function buildSystemMessage(
  title: string,
  body?: string,
  quickReply?: messagingApi.QuickReply,
): messagingApi.FlexMessage {
  const contents: messagingApi.FlexComponent[] = [
    {
      type: "text",
      text: truncate(title, 120),
      weight: "bold",
      size: "md",
      wrap: true,
    },
  ];

  if (body?.trim()) {
    contents.push({
      type: "text",
      text: truncate(body.trim(), 900),
      size: "sm",
      color: "#555555",
      margin: "md",
      wrap: true,
    });
  }

  return {
    type: "flex",
    altText: title,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents,
      },
    },
    ...(quickReply ? { quickReply } : {}),
  };
}

function buildPlotBubble(
  conversationId: string,
  plot: Plot,
  displayName: string,
): messagingApi.FlexBubble {
  const title = plotDisplayName(plot);
  const description = truncate(
    replaceProfileNamePlaceholder(plotSearchDescription(plot), displayName),
    160,
  );
  const imageUrl = firstText(
    plot.imageUrl,
    plot.initialRoomImageUrl,
    plot.characters?.find((character) => character.imageUrl)?.imageUrl,
  );
  const plotId = plot.id ?? plot.plotId ?? "";
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        { type: "text", text: title, weight: "bold", size: "lg", wrap: true },
        {
          type: "text",
          text: description,
          size: "sm",
          color: "#666666",
          margin: "md",
          wrap: true,
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        {
          type: "button",
          style: "primary",
          action: {
            type: "postback",
            label: "このプロットにする",
            data: new URLSearchParams({
              action: "bind",
              conversationId,
              plotId,
            }).toString(),
            displayText: `${title}にする`,
          },
        },
      ],
    },
  };

  if (imageUrl?.startsWith("https://")) {
    bubble.hero = {
      type: "image",
      url: imageUrl,
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
    };
  }

  return bubble;
}

export function buildUnlinkMessage(): messagingApi.FlexBubble {
  return {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "すでにリンク済みです。先ずリンク解除してください",
          size: "md",
          weight: "regular",
          wrap: true,
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "紐づけ解除",
            data: new URLSearchParams({ action: "unlink" }).toString(),
          },
          style: "secondary",
        },
      ],
    },
  };
}

export function segmentsToTextLineMessages(
  binding: ConversationBinding,
  segments: TextSegment[],
  displayName: string,
): messagingApi.TextMessage[] {
  const groups = groupAdjacentSegments(segments).filter((group) =>
    segmentsToText(group.segments),
  );
  if (groups.length === 0) {
    return [];
  }

  return groups.map((group) => {
    const rawText = segmentsToText(group.segments) ?? "";
    const plotPersonaFallback = {
      name: binding.plotName,
      avatarUrl: binding.avatarUrl,
    };
    const persona = group.speakerName?.trim()
      ? resolveSpeakerPersona(
          group.speakerName,
          binding.speakerProfiles,
          plotPersonaFallback,
          displayName,
        )
      : plotPersonaFallback;

    return textMessage(removeMarkdownItalic(rawText), {
      sender: lineSenderFromPersona(persona),
    });
  });
}

export function textMessage(
  text: string,
  extra: Partial<Pick<messagingApi.TextMessage, "sender" | "quickReply">> = {},
): messagingApi.TextMessage {
  return { type: "text", text: truncate(text, 5000), ...extra };
}

export function unlinkQuickReply(): messagingApi.QuickReply {
  return {
    items: [
      {
        type: "action",
        action: {
          type: "postback",
          label: "紐づけ解除",
          data: new URLSearchParams({ action: "unlink" }).toString(),
          displayText: "紐づけ解除",
        },
      },
    ],
  };
}

export function continuationQuickReply(
  continuationId: string,
  sentCount: number,
  totalCount: number,
): messagingApi.QuickReply {
  return {
    items: [
      {
        type: "action",
        action: {
          type: "postback",
          label: `続き: ${sentCount}/${totalCount}`,
          data: new URLSearchParams({
            action: "continue",
            continuationId,
          }).toString(),
          inputOption: "closeRichMenu",
        },
      },
    ],
  };
}

export function retryQuickReply(text: string): messagingApi.QuickReply {
  return {
    items: [
      {
        type: "action",
        action: {
          type: "message",
          label: "再試行",
          text: truncate(text, 300),
        },
      },
    ],
  };
}

export function recommendedQuickReply(
  keywords: string[],
): messagingApi.QuickReply {
  return {
    items: keywords.slice(0, MAX_QUICK_REPLY).map((keyword) => ({
      type: "action",
      action: {
        type: "message",
        label: keyword,
        text: keyword,
      },
    })),
  };
}

function removeMarkdownItalic(text: string): string {
  return text.replace(/\*([^*\n]+)\*/g, "$1");
}

export function plotDisplayName(plot: Plot): string {
  return truncate(
    firstText(
      plot.title,
      plot.name,
      plot.firstCharacterName,
      plot.characters?.find((item) => item?.name)?.name,
    ) ?? "Zeta",
    80,
  );
}

export function plotPersona(plot: Plot): PlotPersona {
  const character = Array.isArray(plot.characters)
    ? plot.characters.find((item) => item?.name || item?.imageUrl)
    : undefined;
  const name =
    firstText(
      plot.title,
      plot.name,
      plot.firstCharacterName,
      character?.name,
    ) ?? "Zeta";
  const avatarUrl = firstText(
    plot.imageUrl,
    plot.initialRoomImageUrl,
    character?.imageUrl,
  );
  return { name: truncate(name, 80), avatarUrl };
}

export function speakerProfilesFromApi(
  profiles: TalkSpeakerProfile[],
): PlotPersona[] {
  return profiles
    .filter((profile) => profile.name?.trim())
    .map((profile) => ({
      name: truncate(profile.name, 80),
      avatarUrl: profile.imageUrl ?? undefined,
    }));
}

export function speakerProfilesFromPlot(plot: Plot): PlotPersona[] {
  const profiles: PlotPersona[] = [];
  for (const character of plot.characters ?? []) {
    if (character.name?.trim()) {
      profiles.push({
        name: truncate(character.name, 80),
        avatarUrl: character.imageUrl ?? undefined,
      });
    }
  }

  for (const chatProfile of plot.chatProfiles ?? []) {
    if (chatProfile.name?.trim()) {
      profiles.push({
        name: truncate(chatProfile.name, 80),
        avatarUrl: chatProfile.imageUrl ?? undefined,
      });
    }
  }

  return profiles;
}

export function mergeSpeakerProfiles(
  ...profileLists: PlotPersona[][]
): PlotPersona[] {
  const merged = new Map<string, PlotPersona>();
  for (const profiles of profileLists) {
    for (const profile of profiles) {
      const name = profile.name.trim();
      if (!name) continue;
      const existing = merged.get(name);
      merged.set(name, {
        name,
        avatarUrl: existing?.avatarUrl ?? profile.avatarUrl,
      });
    }
  }
  return [...merged.values()];
}

export function plotSearchDescription(plot: Plot): string {
  return (
    firstText(plot.longDescription, plot.shortDescription, plot.description) ??
    "No description"
  );
}

export function streamEventToSegments(event: ChatStreamEvent): {
  complete: boolean;
  segments: TextSegment[];
} {
  const complete =
    event.event === "CHAT_COMPLETE" || event.event === "CANDIDATE_COMPLETE";
  const replySegments = messageToSegments(event.replyMessage);
  if (replySegments.length > 0) {
    return { complete, segments: replySegments };
  }

  const chunkSegments = contentsToSegments(event.chunkMessage?.contents);
  if (chunkSegments.length > 0) {
    return { complete, segments: chunkSegments };
  }

  const text =
    typeof event.message === "string" && event.event !== "ERROR"
      ? event.message.trim()
      : "";
  return { complete, segments: text ? [{ text }] : [] };
}

export function messageToSegments(
  message: ZetaMessage | null | undefined,
): TextSegment[] {
  if (!message) return [];
  const contents = contentsToSegments(message.contents);
  if (contents.length > 0) return contents;
  const text = firstText(message.text, message.content);
  return text ? [{ text }] : [];
}

function contentsToSegments(
  contents: ZetaMessage["contents"] | undefined,
): TextSegment[] {
  if (!Array.isArray(contents)) return [];
  return contents.flatMap((content) => {
    const text = content.text?.trim();
    return text ? [{ text, speakerName: content.speakerName }] : [];
  });
}

function resolveSpeakerPersona(
  speakerName: string | undefined,
  profiles: PlotPersona[] | undefined,
  fallback: PlotPersona,
  displayName: string,
): PlotPersona {
  if (speakerName === "__--profileName__") {
    return { name: displayName, avatarUrl: fallback.avatarUrl };
  }

  const trimmed = speakerName?.trim();
  if (!trimmed) return fallback;
  const exact = profiles?.find((profile) => profile.name === trimmed);
  return (
    exact ?? { name: truncate(trimmed, 80), avatarUrl: fallback.avatarUrl }
  );
}

function lineSenderFromPersona(
  persona: PlotPersona,
): messagingApi.TextMessage["sender"] {
  const sender: messagingApi.TextMessage["sender"] = {
    name: truncate(sanitizeLineSenderName(persona.name), 20),
  };
  if (persona.avatarUrl?.startsWith("https://")) {
    sender.iconUrl = persona.avatarUrl;
  }
  return sender;
}

function sanitizeLineSenderName(value: string): string {
  const normalized = value
    .normalize("NFKC")
    .replace(/\bLINE\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized || "Zeta";
}

function groupAdjacentSegments(
  segments: TextSegment[],
): Array<{ speakerName?: string; segments: TextSegment[] }> {
  const groups: Array<{ speakerName?: string; segments: TextSegment[] }> = [];
  for (const segment of segments) {
    const current = groups.at(-1);
    if (current && current.speakerName === segment.speakerName) {
      current.segments.push(segment);
    } else {
      groups.push({ speakerName: segment.speakerName, segments: [segment] });
    }
  }
  return groups;
}

function segmentsToText(segments: TextSegment[]): string | undefined {
  const text = segments
    .map((segment) => segment.text)
    .filter(Boolean)
    .join("\n")
    .trim();
  return text || undefined;
}

export function replaceProfileNamePlaceholder(
  content: string,
  displayName: string,
): string {
  return content.replaceAll("__--profileName__", displayName);
}

export function readIntroMessages(data: unknown): ZetaMessage[] {
  if (!data || typeof data !== "object") return [];
  const value = data as {
    intro?: ZetaMessage | null;
    intros?: ZetaMessage[];
    message?: ZetaMessage | null;
  };
  if (Array.isArray(value.intros) && value.intros.length > 0) {
    return value.intros;
  }
  return [value.intro, value.message].filter(
    (message): message is ZetaMessage => Boolean(message),
  );
}

export function firstText(
  ...values: Array<string | null | undefined>
): string | undefined {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1))}…`;
}
