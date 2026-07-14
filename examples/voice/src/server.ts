import index from "./index.html";
import { authenticationStatus, configuredRoomId, createRoomFromPlot, getRoomView, listRoomViews, searchPlots, sendMessage } from "./zeta.ts";
import type { SynthesisRequest } from "./types.ts";
import { VoicevoxClient } from "./voicevox.ts";

const voicevox = new VoicevoxClient(Bun.env.VOICEVOX_URL ?? "http://127.0.0.1:50021");
const encoder = new TextEncoder();

const server = Bun.serve({
  port: Number(Bun.env.PORT ?? 3000),
  routes: {
    "/": index,
    "/api/config": () => Response.json({ roomId: configuredRoomId() }),
    "/api/status": async () => {
      const [zeta, voicevoxStatus] = await Promise.all([
        authenticationStatus(),
        voicevox.version()
          .then((version) => ({ state: "connected" as const, label: "接続済み", detail: `VOICEVOX ${version}` }))
          .catch((error) => ({ state: "error" as const, label: "未接続", detail: errorMessage(error) })),
      ]);
      return Response.json({ zeta, voicevox: voicevoxStatus });
    },
    "/api/voicevox/speakers": async () => apiResponse(() => voicevox.speakers()),
    "/api/plots/search": async (request) => apiResponse(async () => {
      const keyword = new URL(request.url).searchParams.get("q")?.trim();
      if (!keyword) throw new ClientError("検索キーワードを入力してください");
      return { plots: await searchPlots(keyword) };
    }),
    "/api/plots/:plotId/rooms": {
      POST: async (request) => apiResponse(() => createRoomFromPlot(request.params.plotId)),
    },
    "/api/rooms": async () => apiResponse(async () => ({ rooms: await listRoomViews() })),
    "/api/rooms/:roomId": async (request) => apiResponse(() => getRoomView(request.params.roomId)),
    "/api/speech": {
      POST: async (request) => {
        try {
          const body = await request.json() as SynthesisRequest;
          const { audio, cacheHit } = await voicevox.synthesize(body);
          return new Response(audio, {
            headers: {
              "content-type": "audio/wav",
              "cache-control": "private, max-age=31536000, immutable",
              "x-voice-cache": cacheHit ? "HIT" : "MISS",
            },
          });
        } catch (error) {
          return errorResponse(error);
        }
      },
    },
    "/api/chat": {
      POST: async (request) => {
        try {
          const body = await request.json() as { roomId?: string; text?: string };
          const roomId = body.roomId?.trim() || configuredRoomId();
          const text = body.text?.trim();
          if (!roomId || !text) return errorResponse(new Error("roomId と text は必須です"), 400);
          return eventStream(roomId, text);
        } catch (error) {
          return errorResponse(error, 400);
        }
      },
    },
  },
  development: { hmr: true, console: true },
});

console.log(`Zeta Voice: ${server.url}`);

function eventStream(roomId: string, text: string): Response {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const update of sendMessage(roomId, text)) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
        }
        controller.enqueue(encoder.encode("event: done\ndata: {}\n\n"));
      } catch (error) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: errorMessage(error) })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache",
      connection: "keep-alive",
    },
  });
}

async function apiResponse<T>(action: () => Promise<T>): Promise<Response> {
  try {
    return Response.json(await action());
  } catch (error) {
    return errorResponse(error, error instanceof ClientError ? 400 : 502);
  }
}

class ClientError extends Error {}

function errorResponse(error: unknown, status = 502): Response {
  return Response.json({ error: errorMessage(error) }, { status });
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
