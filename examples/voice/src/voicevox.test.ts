import { expect, test } from "bun:test";
import { normalizeSynthesisRequest, synthesisCacheKey, VoicevoxClient } from "./voicevox.ts";
import type { SynthesisRequest } from "./types.ts";

const request: SynthesisRequest = {
  messageId: "message-1",
  text: "  こんにちは　世界 ",
  voice: {
    speakerId: "speaker-uuid",
    styleId: 2,
    speakerName: "四国めたん",
    styleName: "あまあま",
    speedScale: 0.9,
    pitchScale: 0,
    intonationScale: 1.2,
    volumeScale: 1,
  },
};

test("cache key changes when a voice setting changes", async () => {
  const original = await synthesisCacheKey(request);
  const changed = await synthesisCacheKey({ ...request, voice: { ...request.voice, speedScale: 1.1 } });
  const changedStyle = await synthesisCacheKey({ ...request, voice: { ...request.voice, styleId: 4 } });
  expect(changed).not.toBe(original);
  expect(changedStyle).not.toBe(original);
});

test("synthesis reuses audio for the same message and casting", async () => {
  let calls = 0;
  const fetcher = (async (input: string | URL | Request) => {
    calls += 1;
    const url = String(input);
    if (url.includes("audio_query")) return Response.json({ speedScale: 1 });
    return new Response(new Uint8Array([1, 2, 3]), { headers: { "content-type": "audio/wav" } });
  }) as typeof fetch;
  const client = new VoicevoxClient("http://voicevox.test", fetcher);

  expect((await client.synthesize(request)).cacheHit).toBe(false);
  expect((await client.synthesize(request)).cacheHit).toBe(true);
  expect(calls).toBe(2);
});

test("reads the VOICEVOX engine version for connection status", async () => {
  const fetcher = (async () => Response.json("0.22.0")) as unknown as typeof fetch;
  const client = new VoicevoxClient("http://voicevox.test", fetcher);
  expect(await client.version()).toBe("0.22.0");
});

test("accepts a legacy numeric speakerId as the style ID", () => {
  const legacy = { ...request, voice: { ...request.voice, speakerId: 2, styleId: undefined } } as unknown as SynthesisRequest;
  const normalized = normalizeSynthesisRequest(legacy);
  expect(normalized.voice.styleId).toBe(2);
  expect(normalized.voice.speakerId).toBe("四国めたん");
});
