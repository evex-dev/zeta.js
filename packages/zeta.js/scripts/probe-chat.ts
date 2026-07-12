import { createZetaClient, ApiError, type StreamEvent, type BaseClient } from "../index.ts";

const token = Bun.env.TOKEN;
const refreshToken = Bun.env.REFRESH_TOKEN;

if (!token && !refreshToken) {
  throw new Error("Set TOKEN and REFRESH_TOKEN in api/.env before running chat probe.");
}

const client = createZetaClient({
  token,
  refreshToken,
  deviceId: Bun.env.DEVICE_ID,
  userLanguage: parseLanguage(Bun.env.USER_LANGUAGE),
  defaultHeaders: {
    "X-Client-Type": Bun.env.CLIENT_TYPE ?? "app",
    "X-Device-Type": Bun.env.DEVICE_TYPE ?? "android",
    "X-Client-Version": Bun.env.CLIENT_VERSION ?? "3.39.14",
    "X-Client-Native-Version": Bun.env.CLIENT_NATIVE_VERSION ?? "3.39.14",
  },
  onTokenUpdate(tokens) {
    console.log("refresh succeeded", {
      accessToken: Boolean(tokens.accessToken),
      refreshToken: Boolean(tokens.refreshToken),
    });
  },
});

const plotId = await resolveProbePlotId(client.baseClient);
const room = await client.baseClient.talk.createRoom({ plotId });
const roomId = readId(room.data, ["id", "roomId"]);

if (!roomId) {
  throw new Error(`Could not create room for chat probe: ${JSON.stringify(summarize(room.data))}`);
}

console.log(JSON.stringify({ step: "room-created", roomId, plotId, shape: describeShape(room.data), sample: summarize(room.data) }));

const message = Bun.env.PROBE_CHAT_MESSAGE ?? "Hello. Please reply in one short sentence.";
const bodies = [
  { type: "TEXT", text: message },
  { message },
  { text: message },
  { content: message },
  { prompt: message },
  { messages: [{ role: "USER", content: message }] },
];

try {
  let success = false;

  for (const body of bodies) {
    try {
      const events = await collectStream(roomId, body);
      console.log(JSON.stringify({
        ok: true,
        bodyKeys: Object.keys(body),
        eventCount: events.length,
        eventShapes: events.slice(0, 8).map((event) => describeShape(event.data)),
        samples: events.slice(0, 5).map((event) => summarize(event.data)),
      }));
      success = true;
      break;
    } catch (error) {
      console.log(JSON.stringify({
        ok: false,
        bodyKeys: Object.keys(body),
        ...describeError(error),
      }));
    }
  }

  if (!success) {
    throw new Error("All candidate stream request bodies failed.");
  }

  const messages = await client.baseClient.talk.listMessages(roomId, { limit: 10 });
  console.log(JSON.stringify({
    step: "messages-after-stream",
    shape: describeShape(messages.data),
    sample: summarize(messages.data),
  }));
} finally {
  if (Bun.env.PROBE_KEEP_ROOM !== "1") {
    await client.baseClient.talk.deleteRoom(roomId).catch((error) => {
      console.error(JSON.stringify({
        cleanupFailed: "DELETE /v1/rooms/:roomId",
        roomId,
        ...describeError(error),
      }));
    });
  }
}

async function collectStream(roomId: string, body: Record<string, unknown>): Promise<Array<StreamEvent<unknown>>> {
  const stream = await client.baseClient.talk.streamMessage(roomId, body);
  const events: Array<StreamEvent<unknown>> = [];
  const timeout = AbortSignal.timeout(30_000);

  for await (const event of stream) {
    events.push(event);
    if (events.length >= 60 || timeout.aborted) {
      break;
    }
  }

  return events;
}

async function resolveProbePlotId(c: BaseClient): Promise<string> {
  if (Bun.env.PROBE_PLOT_ID) {
    return Bun.env.PROBE_PLOT_ID;
  }

  const search = await c.search.searchPlots({ keyword: "romance", limit: 1 });
  const first = search.data.plots[0];
  if (first?.id) {
    return first.id;
  }

  throw new Error("Could not resolve PROBE_PLOT_ID from /v1/plots/search.");
}

function readId(data: unknown, keys: string[]): string | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  for (const key of keys) {
    const value = (data as Record<string, unknown>)[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

function describeShape(data: unknown): string {
  if (Array.isArray(data)) {
    return `array(${data.length})`;
  }

  if (data && typeof data === "object") {
    return `object(${Object.keys(data).slice(0, 12).join(",")})`;
  }

  return typeof data;
}

function summarize(data: unknown): unknown {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return `array(${data.length})`;
  }

  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data).slice(0, 10)) {
    if (Array.isArray(value)) {
      out[key] = `array(${value.length})`;
    } else if (value && typeof value === "object") {
      out[key] = `object(${Object.keys(value).slice(0, 10).join(",")})`;
    } else if (typeof value === "string" && value.length > 120) {
      out[key] = `${value.slice(0, 120)}...`;
    } else {
      out[key] = value;
    }
  }
  return out;
}

function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
      shape: describeShape(error.data),
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      errorName: error.name,
    };
  }

  return { message: String(error) };
}

function parseLanguage(value: string | undefined): "KOREAN" | "JAPANESE" | "ENGLISH" | undefined {
  if (value === "KOREAN" || value === "JAPANESE" || value === "ENGLISH") {
    return value;
  }
  return undefined;
}
