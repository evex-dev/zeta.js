import { ZetaClient, type ChatStreamEvent, type Message, type Plot, type Room, type TalkSpeakerProfile, type TokenPair } from "@evex/zeta";
import type { SpeechSegment } from "./types.ts";

type Credentials = { token: string; refreshToken?: string; deviceId?: string };
type StreamUpdate = { text: string; messageId: string; complete: boolean; segments: SpeechSegment[] };

let clientPromise: Promise<ZetaClient> | undefined;

export function configuredRoomId(): string | undefined {
  return Bun.env.ZETA_ROOM_ID?.trim() || undefined;
}

export async function getZetaClient(): Promise<ZetaClient> {
  clientPromise ??= createClient().catch((error) => {
    clientPromise = undefined;
    throw error;
  });
  return await clientPromise;
}

export async function authenticationStatus(): Promise<{
  state: "connected" | "not_configured" | "error";
  label: string;
  detail?: string;
}> {
  if (!(await credentialsConfigured())) {
    return { state: "not_configured", label: "未設定", detail: "ZETA_TOKEN または data/zeta.json を設定してください" };
  }
  try {
    const client = await getZetaClient();
    const user = await client.profile.me();
    const data = user.data;
    const displayName = firstText(data?.nickname, data?.name, data?.username);
    return { state: "connected", label: displayName ?? "認証済み", detail: displayName ? `${displayName}として接続中` : "Zeta APIに接続済み" };
  } catch (error) {
    return { state: "error", label: "認証エラー", detail: safeErrorMessage(error) };
  }
}

export async function roomCharacters(roomId: string) {
  const client = await getZetaClient();
  return await client.talk.fromId(roomId).getSpeakerProfiles();
}

export type PlotView = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  characters: Array<{ id?: string; name: string; imageUrl?: string; description?: string }>;
};

export type HistoryMessage = {
  id: string;
  direction: "user" | "assistant";
  text: string;
  speakerName?: string;
  createdAt?: string;
  isIntro: boolean;
  segments: SpeechSegment[];
};

export type RoomView = {
  roomId: string;
  plot: PlotView;
  characters: Array<{ id?: string; name: string; imageUrl?: string; description?: string }>;
  messages: HistoryMessage[];
};

export type RoomSummary = {
  roomId: string;
  plot: PlotView;
  lastMessage?: string;
  updatedAt?: string;
};

export async function listRoomViews(): Promise<RoomSummary[]> {
  const client = await getZetaClient();
  const result = await client.talk.list({ limit: 30 });
  const rooms = result.data.rooms ?? [];
  const summaries = await Promise.all(rooms.map(async (room): Promise<RoomSummary | undefined> => {
    const roomId = room.id ?? room.roomId;
    if (!roomId) return undefined;
    const plot = room.plot ?? await loadRoomPlot(client, room);
    const normalizedPlot = plotView(plot);
    if (!normalizedPlot) return undefined;
    return {
      roomId,
      plot: normalizedPlot,
      lastMessage: messageText(room.lastMessage) || undefined,
      updatedAt: isoDate(room.updatedAt ?? room.createdAt),
    };
  }));
  return summaries
    .filter((room): room is RoomSummary => Boolean(room))
    .toSorted((left, right) => timestamp(right.updatedAt) - timestamp(left.updatedAt));
}

export async function searchPlots(keyword: string): Promise<PlotView[]> {
  const client = await getZetaClient();
  const result = await client.search.searchPlots({ keyword, limit: 12 });
  const plots = (result.data.plots ?? []).filter((plot) => Boolean(plot.id ?? plot.plotId));
  const hydrated = await Promise.all(plots.map(async (plot) => {
    const id = plot.id ?? plot.plotId;
    return id ? await client.plots.get(id).then((resource) => resource.data ?? plot).catch(() => plot) : plot;
  }));
  return hydrated.map(plotView).filter((plot): plot is PlotView => Boolean(plot));
}

export async function createRoomFromPlot(plotId: string): Promise<RoomView> {
  const client = await getZetaClient();
  const talk = await client.talk.create({ plotId });
  await talk.createIntro().catch(() => undefined);
  return await getRoomView(talk.id);
}

export async function getRoomView(roomId: string): Promise<RoomView> {
  const client = await getZetaClient();
  const talk = client.talk.fromId(roomId);
  const [roomResult, speakers, messageResult] = await Promise.all([
    talk.refresh(),
    talk.getSpeakerProfiles().catch(() => []),
    talk.listMessages({ limit: 100 }).catch(() => undefined),
  ]);
  const room = roomResult.data;
  const plot = room.plot ?? await loadRoomPlot(client, room);
  const normalizedPlot = plotView(plot);
  if (!normalizedPlot) throw new Error("ルームのプロット情報を取得できませんでした");
  const characters = mergeCharacters(normalizedPlot.characters, speakers);
  const messages = (messageResult?.data.messages ?? [])
    .map((message, index) => historyMessage(message, index))
    .filter((message): message is HistoryMessage => Boolean(message))
    .toSorted((left, right) => timestamp(left.createdAt) - timestamp(right.createdAt));
  return { roomId, plot: { ...normalizedPlot, characters }, characters, messages };
}

export async function* sendMessage(roomId: string, text: string): AsyncGenerator<StreamUpdate> {
  const client = await getZetaClient();
  const stream = await client.talk.fromId(roomId).sendTextMessage(text);
  let latestText = "";
  let latestSegments: SpeechSegment[] = [];
  let messageId: string = crypto.randomUUID();

  for await (const item of stream) {
    const event = item.data as ChatStreamEvent;
    const message = event.replyMessage ?? event.chunkMessage;
    const nextSegments = messageSegments(message);
    const nextText = nextSegments.map((segment) => segment.text).join("\n") || (event.event !== "ERROR" && typeof event.message === "string" ? event.message.trim() : "");
    if (nextText) latestText = nextText;
    if (nextSegments.length > 0) latestSegments = nextSegments;
    if (typeof message?.id === "string" && message.id) messageId = message.id;
    if (event.event === "ERROR") throw new Error(typeof event.message === "string" ? event.message : "Zeta stream error");
    const complete = event.event === "CHAT_COMPLETE" || event.event === "CANDIDATE_COMPLETE";
    if (latestText) yield { text: latestText, messageId, complete, segments: latestSegments };
  }
}

function messageText(message: Partial<Message> | null | undefined): string {
  const parts = messageSegments(message).map((segment) => segment.text);
  if (parts.length > 0) return parts.join("\n");
  return (message?.text ?? message?.content ?? "").trim();
}

export function messageSegments(message: Partial<Message> | null | undefined): SpeechSegment[] {
  return (message?.contents ?? []).flatMap((content) => {
    const text = content.text?.trim();
    return text ? [{ text, speakerName: content.speakerName, position: content.position }] : [];
  });
}

function plotView(plot: Plot | undefined): PlotView | undefined {
  const id = plot?.id ?? plot?.plotId;
  if (!plot || !id) return undefined;
  const firstCharacter = plot.characters?.find((character) => character.name || character.imageUrl);
  return {
    id,
    title: firstText(plot.title, plot.name, plot.firstCharacterName, firstCharacter?.name) ?? "無題のプロット",
    description: firstText(plot.shortDescription, plot.description, plot.longDescription) ?? "",
    imageUrl: firstText(plot.imageUrl, plot.initialRoomImageUrl, firstCharacter?.imageUrl),
    characters: (plot.characters ?? []).filter((character) => character.name).map((character) => ({
      id: character.id,
      name: character.name!,
      imageUrl: character.imageUrl ?? undefined,
      description: character.description,
    })),
  };
}

async function loadRoomPlot(client: ZetaClient, room: Room): Promise<Plot | undefined> {
  const plotId = room.plotId;
  if (!plotId) return undefined;
  return await client.plots.get(plotId).then((resource) => resource.data).catch(() => undefined);
}

function mergeCharacters(characters: PlotView["characters"], speakers: TalkSpeakerProfile[]): PlotView["characters"] {
  const result = [...characters];
  for (const speaker of speakers.filter((item) => item.source === "character")) {
    if (!speaker.name || result.some((character) => character.name === speaker.name)) continue;
    result.push({ id: typeof speaker.id === "string" ? speaker.id : undefined, name: speaker.name, imageUrl: speaker.imageUrl ?? undefined });
  }
  return result;
}

function historyMessage(message: Message, index: number): HistoryMessage | undefined {
  const text = messageText(message);
  if (!text) return undefined;
  const direction = messageDirection(message, index);
  const segments = messageSegments(message);
  const rawTime = message.messageTime ?? message.createdAt ?? message.updatedAt;
  const createdAt = isoDate(rawTime);
  return {
    id: message.id ?? message.messageId ?? `history-${index}`,
    direction,
    text,
    speakerName: segments.find((segment) => segment.speakerName)?.speakerName,
    createdAt,
    isIntro: Boolean(message.isIntro),
    segments,
  };
}

export function messageDirection(message: Message, fallbackIndex: number): "user" | "assistant" {
  const sender = message.sender;
  const senderMarker = typeof sender === "string"
    ? sender
    : sender && typeof sender === "object" ? `${sender.type ?? ""} ${sender.id ?? ""}` : "";
  const marker = `${message.role ?? ""} ${senderMarker}`.toLowerCase();
  if (/\b(user|human|profile|me)\b/.test(marker)) return "user";
  if (/\b(assistant|character|bot|ai|zeta|model)\b/.test(marker)) return "assistant";
  if (message.isIntro) return "assistant";
  return fallbackIndex % 2 === 0 ? "user" : "assistant";
}

function firstText(...values: Array<string | null | undefined>): string | undefined {
  return values.find((value) => Boolean(value?.trim()))?.trim();
}

function timestamp(value: string | undefined): number {
  const parsed = Date.parse(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function isoDate(value: string | Date | undefined): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : undefined;
}

async function createClient(): Promise<ZetaClient> {
  const credentials = await readCredentials();
  return new ZetaClient({
    token: credentials.token,
    refreshToken: credentials.refreshToken,
    deviceId: credentials.deviceId,
    userLanguage: "JAPANESE",
    onTokenUpdate: async (tokens) => persistTokens(credentials, tokens),
  });
}

async function readCredentials(): Promise<Credentials> {
  const fromEnvironment = Bun.env.ZETA_TOKEN?.trim();
  if (fromEnvironment) {
    return {
      token: fromEnvironment,
      refreshToken: Bun.env.ZETA_REFRESH_TOKEN?.trim(),
      deviceId: Bun.env.ZETA_DEVICE_ID?.trim(),
    };
  }

  const file = Bun.file(new URL("../data/zeta.json", import.meta.url));
  if (!(await file.exists())) {
    throw new Error("Zeta認証情報がありません。ZETA_TOKEN を設定するか data/zeta.json を作成してください。");
  }
  const raw = await file.json() as { token?: string; refresh_token?: string; device_id?: string };
  if (!raw.token) throw new Error("data/zeta.json に token がありません");
  return { token: raw.token, refreshToken: raw.refresh_token, deviceId: raw.device_id };
}

async function credentialsConfigured(): Promise<boolean> {
  if (Bun.env.ZETA_TOKEN?.trim()) return true;
  return await Bun.file(new URL("../data/zeta.json", import.meta.url)).exists();
}

function safeErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 180);
}

async function persistTokens(previous: Credentials, tokens: TokenPair): Promise<void> {
  previous.token = tokens.accessToken;
  previous.refreshToken = tokens.refreshToken ?? previous.refreshToken;
  if (Bun.env.ZETA_TOKEN) return;
  await Bun.write(new URL("../data/zeta.json", import.meta.url), `${JSON.stringify({
    token: previous.token,
    refresh_token: previous.refreshToken,
    device_id: previous.deviceId,
  }, null, 2)}\n`);
}
