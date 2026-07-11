import type { ChatStreamEvent, Message, Talk, ZetaClient } from "../../../index.ts";
import { createConfiguredZetaClient, statePath } from "./config.ts";
import { readState, writeState, type TranscriptEntry, type ZetaloopState } from "./state.ts";
import { SideBySideRenderer } from "./terminal.ts";
import { messageToText, streamEventToText, truncate } from "./text.ts";

type Side = "a" | "b";

type LoopOptions = {
  turns: number;
  seed?: string;
  delayMs: number;
};

const rawArgs = Bun.argv.slice(2);
if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
  printHelp();
  process.exit(0);
}

const options = parseArgs(rawArgs);
const zeta = await createConfiguredZetaClient();
const state = await readState();
const renderer = new SideBySideRenderer();
const uiHistory: UiHistory = { a: [], b: [] };

try {
  const rooms = await ensureRooms(zeta, state);
  await writeState(state);
  const roomMessages = {
    a: await loadRoomMessages(rooms.a),
    b: await loadRoomMessages(rooms.b),
  };
  uiHistory.a = messagesToVisibleEntries(roomMessages.a);
  uiHistory.b = messagesToVisibleEntries(roomMessages.b);

  let seed = await resolveInitialSeed(options, rooms, roomMessages);
  render(state, renderer, uiHistory);

  for (let turn = 1; turn <= options.turns; turn += 1) {
    appendUiEntry(uiHistory, seed.side, "input", seed.text);
    const firstOutput = await sendAndRender(rooms[seed.side], state, uiHistory, seed.side, seed.text);

    await sleep(options.delayMs);
    const nextSide = oppositeSide(seed.side);
    appendUiEntry(uiHistory, nextSide, "input", firstOutput);
    const secondOutput = await sendAndRender(rooms[nextSide], state, uiHistory, nextSide, firstOutput);

    seed = { side: seed.side, text: secondOutput };
    await sleep(options.delayMs);
  }
} finally {
  renderer.close();
}

console.log(`Saved state to ${statePath}`);

async function ensureRooms(client: ZetaClient, current: ZetaloopState): Promise<{ a: Talk; b: Talk }> {
  current.rooms ??= {};
  current.chatProfiles ??= {};

  if (!current.rooms.a) {
    const profileId = await ensureChatProfile(client, current, "a", current.plots.b.characterName);
    const room = await client.talk.create({
      plotId: current.plots.a.id,
      title: `zetaloop A: ${current.plots.a.name}`,
      chatProfile: {
        type: "userChatProfileId",
        id: profileId,
      },
    });
    current.rooms.a = room.id;
    await selectChatProfile(client, profileId, current.plots.a.id, room.id);
  } else {
    const profileId = await ensureChatProfile(client, current, "a", current.plots.b.characterName);
    await selectChatProfile(client, profileId, current.plots.a.id, current.rooms.a);
  }
  if (!current.rooms.b) {
    const profileId = await ensureChatProfile(client, current, "b", current.plots.a.characterName);
    const room = await client.talk.create({
      plotId: current.plots.b.id,
      title: `zetaloop B: ${current.plots.b.name}`,
      chatProfile: {
        type: "userChatProfileId",
        id: profileId,
      },
    });
    current.rooms.b = room.id;
    await selectChatProfile(client, profileId, current.plots.b.id, room.id);
  } else {
    const profileId = await ensureChatProfile(client, current, "b", current.plots.a.characterName);
    await selectChatProfile(client, profileId, current.plots.b.id, current.rooms.b);
  }

  return {
    a: client.talk.fromId(current.rooms.a),
    b: client.talk.fromId(current.rooms.b),
  };
}

async function ensureChatProfile(client: ZetaClient, current: ZetaloopState, side: "a" | "b", name: string): Promise<string> {
  current.chatProfiles ??= {};
  const existingId = current.chatProfiles[side];
  const description = side === "a"
    ? `zetaloop用: plot A (${current.plots.a.name})`
    : `zetaloop用: plot B (${current.plots.b.name})`;

  if (existingId) {
    const updated = await client.profile.chatProfiles
      .fromId(existingId)
      .update({ name, description })
      .then(() => true)
      .catch(() => false);
    if (updated) {
      return existingId;
    }
  }

  const profile = await client.profile.chatProfiles.create({ name, description });
  const id = profile.data?.id;
  if (!id) {
    throw new Error(`Created chat profile for side ${side.toUpperCase()} did not include an id.`);
  }

  current.chatProfiles[side] = id;
  return id;
}

async function selectChatProfile(client: ZetaClient, chatProfileId: string, plotId: string, roomId: string): Promise<void> {
  await client.profile.chatProfiles
    .select(chatProfileId, { plotId, roomId })
    .catch(() => undefined);
}

async function sendAndRender(
  talk: Talk,
  current: ZetaloopState,
  history: UiHistory,
  side: Side,
  input: string,
): Promise<string> {
  let latest = "";
  let completed = "";
  const stream = await talk.sendTextMessage(input);

  for await (const event of stream) {
    const parsed = streamEventToText(event.data as ChatStreamEvent);
    if (parsed.error) {
      throw new Error(`Zeta stream error: ${parsed.error}`);
    }
    if (parsed.text) {
      latest = parsed.text;
    }
    if (parsed.complete && parsed.text) {
      completed = parsed.text;
    }
    render(current, renderer, history, side, latest);
  }

  const output = completed || latest;
  if (!output) {
    throw new Error(`${side.toUpperCase()} returned an empty response.`);
  }

  appendUiEntry(history, side, "output", output);
  render(current, renderer, history);
  return output;
}

type UiHistory = {
  a: TranscriptEntry[];
  b: TranscriptEntry[];
};

type SeedPlan = {
  side: Side;
  text: string;
};

async function resolveInitialSeed(options: LoopOptions, rooms: Record<Side, Talk>, roomMessages: Record<Side, Message[]>): Promise<SeedPlan> {
  if (options.seed) {
    return { side: "a", text: options.seed };
  }

  const lastBOutput = latestOutputText(roomMessages.b);
  if (lastBOutput) {
    return { side: "a", text: lastBOutput };
  }

  const lastAOutput = latestOutputText(roomMessages.a);
  if (lastAOutput) {
    return { side: "b", text: lastAOutput };
  }

  const introA = await loadIntroText(rooms.a);
  if (introA) {
    return { side: "b", text: introA };
  }

  const introB = await loadIntroText(rooms.b);
  if (introB) {
    return { side: "a", text: introB };
  }

  return { side: "a", text: "短く話しかけて、相手が返しやすい一言で終えてください。" };
}

async function loadRoomMessages(talk: Talk): Promise<Message[]> {
  return await talk.listMessages({ limit: 20 })
    .then((result) => result.data.messages ?? [])
    .catch(() => []);
}

function messagesToVisibleEntries(messages: Message[]): TranscriptEntry[] {
  const withText = messages
    .filter((message) => !message.isIntro)
    .map((message, index) => ({ message, index, text: messageToText(message) }))
    .filter((item): item is { message: Message; index: number; text: string } => Boolean(item.text));
  const source = withText.length > 0
    ? withText
    : messages
      .map((message, index) => ({ message, index, text: messageToText(message) }))
      .filter((item): item is { message: Message; index: number; text: string } => Boolean(item.text));

  const sorted = source.toSorted((left, right) => {
    const leftTime = messageTimestamp(left.message);
    const rightTime = messageTimestamp(right.message);
    if (leftTime !== undefined && rightTime !== undefined) {
      return leftTime - rightTime;
    }
    return left.index - right.index;
  });

  return sorted.map((item, index) => ({
    at: messageIsoTime(item.message) ?? new Date(0).toISOString(),
    direction: messageDirection(item.message, index),
    text: item.text,
  })).slice(-2);
}

async function loadIntroText(talk: Talk): Promise<string | undefined> {
  const fromMessages = messagesToTexts(await loadRoomMessages(talk).then((messages) => messages.filter((message) => message.isIntro)));
  if (fromMessages.length > 0) {
    return fromMessages.at(-1);
  }

  const created = await talk.createIntro()
    .then((result) => introMessagesFromResult(result.data))
    .catch(() => []);
  const createdTexts = messagesToTexts(created);
  if (createdTexts.length > 0) {
    return createdTexts.at(-1);
  }

  const beforeSelection = await talk.getIntroBeforeSelection()
    .then((result) => introMessagesFromResult(result.data))
    .catch(() => []);
  return messagesToTexts(beforeSelection).at(-1);
}

function introMessagesFromResult(data: unknown): Message[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const value = data as { intro?: Message | null; intros?: Message[]; message?: Message | null };
  if (Array.isArray(value.intros) && value.intros.length > 0) {
    return value.intros;
  }
  return [value.intro, value.message].filter((message): message is Message => Boolean(message));
}

function messagesToTexts(messages: Message[]): string[] {
  return messages
    .map((message) => messageToText(message))
    .filter((text): text is string => Boolean(text));
}

function latestOutputText(messages: Message[]): string | undefined {
  return messagesToVisibleEntries(messages)
    .filter((entry) => entry.direction === "output")
    .at(-1)
    ?.text;
}

function appendUiEntry(history: UiHistory, side: Side, direction: TranscriptEntry["direction"], text: string): void {
  history[side] = [...history[side], { at: new Date().toISOString(), direction, text }];
}

function render(current: ZetaloopState, activeRenderer: SideBySideRenderer, history: UiHistory, streamingSide?: Side, streamingText?: string): void {
  activeRenderer.render({
    plot: current.plots.a,
    roomId: current.rooms?.a,
    entries: history.a,
    streaming: streamingSide === "a" ? streamingText : undefined,
  }, {
    plot: current.plots.b,
    roomId: current.rooms?.b,
    entries: history.b,
    streaming: streamingSide === "b" ? streamingText : undefined,
  });
}

function oppositeSide(side: Side): Side {
  return side === "a" ? "b" : "a";
}

function messageDirection(message: Message, fallbackIndex: number): TranscriptEntry["direction"] {
  const marker = `${message.role ?? ""} ${message.sender ?? ""}`.toLowerCase();
  if (/\b(user|human|profile|me)\b/.test(marker)) {
    return "input";
  }
  if (/\b(assistant|character|bot|ai|zeta|model)\b/.test(marker)) {
    return "output";
  }
  return fallbackIndex % 2 === 0 ? "input" : "output";
}

function messageTimestamp(message: Message): number | undefined {
  const value = message.messageTime ?? message.createdAt ?? message.updatedAt;
  const time = value instanceof Date ? value.getTime() : Date.parse(String(value ?? ""));
  return Number.isFinite(time) ? time : undefined;
}

function messageIsoTime(message: Message): string | undefined {
  const timestamp = messageTimestamp(message);
  return timestamp === undefined ? undefined : new Date(timestamp).toISOString();
}

function parseArgs(args: string[]): LoopOptions {
  const options: LoopOptions = {
    turns: numberValue(Bun.env.ZETALOOP_TURNS, 4),
    seed: Bun.env.ZETALOOP_SEED,
    delayMs: numberValue(Bun.env.ZETALOOP_DELAY_MS, 600),
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];
    if ((arg === "--turns" || arg === "-n") && next) {
      options.turns = numberValue(next, options.turns);
      index += 1;
    } else if (arg === "--seed" && next) {
      options.seed = next;
      index += 1;
    } else if (arg === "--delay-ms" && next) {
      options.delayMs = numberValue(next, options.delayMs);
      index += 1;
    }
  }

  if (options.seed) {
    options.seed = truncate(options.seed, 2000);
  }
  return options;
}

function numberValue(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function printHelp(): void {
  console.log(`Usage:
  bun run loop -- --turns 4 --seed "短く自己紹介して、相手に質問してください。"

Options:
  --turns, -n   Number of A->B cycles
  --seed        Initial message. If omitted, loop uses an intro after init or the latest counterpart response when resuming.
  --delay-ms    Delay between sends
`);
}
