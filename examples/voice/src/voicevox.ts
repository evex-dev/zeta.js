import type { SynthesisRequest, VoicevoxSpeaker } from "./types.ts";

type AudioQuery = Record<string, unknown> & {
  speedScale?: number;
  pitchScale?: number;
  intonationScale?: number;
  volumeScale?: number;
};

export class VoicevoxClient {
  private readonly cache = new Map<string, Promise<ArrayBuffer>>();

  constructor(
    private readonly baseUrl = "http://127.0.0.1:50021",
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async speakers(): Promise<VoicevoxSpeaker[]> {
    const response = await this.fetcher(`${this.baseUrl}/speakers`);
    if (!response.ok) throw await voicevoxError("話者一覧を取得できませんでした", response);
    return await response.json() as VoicevoxSpeaker[];
  }

  async version(): Promise<string> {
    const response = await this.fetcher(`${this.baseUrl}/version`, { signal: AbortSignal.timeout(3_000) });
    if (!response.ok) throw await voicevoxError("VOICEVOXのバージョンを取得できませんでした", response);
    const text = await response.text();
    let value: unknown = text;
    try { value = JSON.parse(text); } catch { /* Some compatible engines return plain text. */ }
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && "version" in value) return String(value.version);
    return "接続済み";
  }

  async synthesize(request: SynthesisRequest): Promise<{ audio: ArrayBuffer; cacheHit: boolean }> {
    const normalized = normalizeSynthesisRequest(request);
    validateSynthesisRequest(normalized);
    const key = await synthesisCacheKey(normalized);
    const existing = this.cache.get(key);
    if (existing) return { audio: await existing, cacheHit: true };

    const pending = this.synthesizeUncached(normalized).catch((error) => {
      this.cache.delete(key);
      throw error;
    });
    this.cache.set(key, pending);
    return { audio: await pending, cacheHit: false };
  }

  private async synthesizeUncached(request: SynthesisRequest): Promise<ArrayBuffer> {
    const speaker = String(request.voice.styleId);
    const queryUrl = new URL(`${this.baseUrl}/audio_query`);
    queryUrl.searchParams.set("text", normalizeText(request.text));
    queryUrl.searchParams.set("speaker", speaker);
    const queryResponse = await this.fetcher(queryUrl, { method: "POST" });
    if (!queryResponse.ok) throw await voicevoxError("音声クエリを作れませんでした", queryResponse);

    const query = await queryResponse.json() as AudioQuery;
    query.speedScale = request.voice.speedScale;
    query.pitchScale = request.voice.pitchScale;
    query.intonationScale = request.voice.intonationScale;
    query.volumeScale = request.voice.volumeScale;

    const synthesisUrl = new URL(`${this.baseUrl}/synthesis`);
    synthesisUrl.searchParams.set("speaker", speaker);
    const response = await this.fetcher(synthesisUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(query),
    });
    if (!response.ok) throw await voicevoxError("音声を生成できませんでした", response);
    return await response.arrayBuffer();
  }
}

export function normalizeSynthesisRequest(request: SynthesisRequest): SynthesisRequest {
  const legacySpeakerId = request.voice.speakerId as unknown;
  const styleId = Number.isInteger(request.voice.styleId) ? request.voice.styleId
    : typeof legacySpeakerId === "number" && Number.isInteger(legacySpeakerId) ? legacySpeakerId
      : request.voice.styleId;
  const speakerId = typeof legacySpeakerId === "string" && legacySpeakerId.trim()
    ? legacySpeakerId.trim()
    : request.voice.speakerName?.trim() || (Number.isInteger(styleId) ? `style:${styleId}` : "");
  return { ...request, voice: { ...request.voice, speakerId, styleId } };
}

export function normalizeText(text: string): string {
  return text.normalize("NFKC").replace(/\s+/g, " ").trim();
}

export async function synthesisCacheKey(request: SynthesisRequest): Promise<string> {
  const source = [
    request.messageId,
    request.voice.speakerId,
    request.voice.styleId,
    request.voice.styleName,
    request.voice.speedScale,
    request.voice.pitchScale,
    request.voice.intonationScale,
    request.voice.volumeScale,
    normalizeText(request.text),
  ].join("\u001f");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function validateSynthesisRequest(request: SynthesisRequest): void {
  if (!request.messageId || !normalizeText(request.text)) throw new Error("messageId と text は必須です");
  if (!request.voice.speakerId) throw new Error("speakerId が不正です");
  if (!Number.isInteger(request.voice.styleId) || request.voice.styleId < 0) throw new Error("styleId が不正です");
  for (const key of ["speedScale", "pitchScale", "intonationScale", "volumeScale"] as const) {
    if (!Number.isFinite(request.voice[key])) throw new Error(`${key} が不正です`);
  }
}

async function voicevoxError(message: string, response: Response): Promise<Error> {
  const detail = (await response.text().catch(() => "")).slice(0, 300);
  return new Error(`${message} (${response.status})${detail ? `: ${detail}` : ""}`);
}
