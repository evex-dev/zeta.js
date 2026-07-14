import type { VoiceSetting, VoicevoxSpeaker } from "./types.ts";

export function migrateVoiceSetting(value: unknown, fallback: VoiceSetting, speakers: VoicevoxSpeaker[]): VoiceSetting {
  const previous = isRecord(value) ? value : {};
  const legacySpeakerId = previous.speakerId;
  const styleId = validStyleId(previous.styleId)
    ? previous.styleId
    : validStyleId(legacySpeakerId)
      ? legacySpeakerId
      : fallback.styleId;
  const selected = speakers.flatMap((speaker) => speaker.styles.map((style) => ({ speaker, style })))
    .find(({ style }) => style.id === styleId);

  return {
    speakerId: text(previous.speakerId) ?? (validStyleId(legacySpeakerId) ? selected?.speaker.speakerUuid : undefined) ?? fallback.speakerId,
    styleId,
    speakerName: text(previous.speakerName) ?? selected?.speaker.name ?? fallback.speakerName,
    styleName: text(previous.styleName) ?? selected?.style.name ?? fallback.styleName,
    speedScale: finite(previous.speedScale) ?? fallback.speedScale,
    pitchScale: finite(previous.pitchScale) ?? fallback.pitchScale,
    intonationScale: finite(previous.intonationScale) ?? fallback.intonationScale,
    volumeScale: finite(previous.volumeScale) ?? fallback.volumeScale,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function validStyleId(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) >= 0;
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function finite(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}
