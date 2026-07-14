import type { NarrationMode, SpeechBlock, SpeechSegment, VoiceRole } from "./types.ts";

const SILENCE = /沈黙|黙り込|口を閉ざ|言葉が途切/;
const SIGH = /ため息|溜め息/;
const DISTANT = /遠くで|遠くから/;

// Zetaの構造化メタデータだけで話者を決める。本文は話者判定に使わない。
export function speechBlocksFromSegments(segments: SpeechSegment[], narrationMode: NarrationMode = "read"): SpeechBlock[] {
  const blocks: SpeechBlock[] = [];
  let pendingPause = 0;
  for (const segment of segments) {
    const metadataNarrator = segment.position?.toUpperCase() === "NARRATOR" || segment.speakerName === "ナレーター";
    for (const part of parseMarkdownDisplay(segment.text)) {
      const text = cleanMarkdown(part.text);
      if (!text) continue;
      // 明示的なナレーター、またはキャラクター発言内のイタリックをナレーターにする。
      const role: VoiceRole = metadataNarrator || part.italic ? "narrator" : "character";
      if (role === "narrator" && narrationMode === "display") continue;
      if (role === "narrator" && narrationMode === "effects" && (SILENCE.test(text) || SIGH.test(text))) {
        const pause = SILENCE.test(text) ? 1_600 : 700;
        const previous = blocks.at(-1);
        if (previous) previous.pauseAfterMs = Math.max(previous.pauseAfterMs, pause);
        else pendingPause = Math.max(pendingPause, pause);
        continue;
      }
      const speakerName = role === "character" ? segment.speakerName : undefined;
      const previous = blocks.at(-1);
      const sameSpeaker = previous?.role === role && previous.speakerName === speakerName;
      if (previous && sameSpeaker && pendingPause === 0) {
        previous.text += `\n${text}`;
        previous.sourceText += `\n${part.text}`;
        previous.pauseAfterMs = endingPause(text);
        continue;
      }
      blocks.push({
        id: `speech-${blocks.length + 1}`,
        role,
        speakerName,
        text,
        sourceText: part.text,
        pauseBeforeMs: Math.max(pendingPause, previous ? previous.role === "narrator" && role === "character" ? 620 : 460 : 0),
        pauseAfterMs: endingPause(text),
        volumeScale: DISTANT.test(text) ? 0.72 : 1,
      });
      pendingPause = 0;
    }
  }
  return blocks;
}

export function groupSpeechSegmentsForDisplay(segments: SpeechSegment[]): SpeechSegment[][] {
  const groups: SpeechSegment[][] = [];
  for (const segment of segments) {
    const previous = groups.at(-1);
    const first = previous?.[0];
    if (previous && first?.speakerName === segment.speakerName && first?.position === segment.position) previous.push(segment);
    else groups.push([segment]);
  }
  return groups;
}

// 表示用のMarkdown解析。話者の決定には利用しない。
export function parseMarkdownDisplay(markdown: string): Array<{ text: string; italic: boolean }> {
  const parts: Array<{ text: string; italic: boolean }> = [];
  const pattern = /\*([^*]+)\*/g;
  let cursor = 0;
  for (const match of markdown.matchAll(pattern)) {
    if (match.index > cursor) parts.push({ text: markdown.slice(cursor, match.index), italic: false });
    parts.push({ text: match[1] ?? "", italic: true });
    cursor = match.index + (match[0]?.length ?? 0);
  }
  if (cursor < markdown.length) parts.push({ text: markdown.slice(cursor), italic: false });
  return parts;
}

export function toggleDescription(value: string): string {
  const text = value.trim();
  if (!text) return "";
  return text.startsWith("*") && text.endsWith("*") && text.length >= 2
    ? text.slice(1, -1)
    : `*${text}*`;
}

export function toggleDescriptionAtSelection(value: string, selectionStart: number, selectionEnd: number): {
  value: string;
  selectionStart: number;
  selectionEnd: number;
} {
  const safeStart = Math.max(0, Math.min(selectionStart, value.length));
  const safeEnd = Math.max(safeStart, Math.min(selectionEnd, value.length));
  const lineStart = value.lastIndexOf("\n", Math.max(0, safeStart - 1)) + 1;
  const selectionEndsAtNextLine = safeEnd > safeStart && value[safeEnd - 1] === "\n";
  const endProbe = selectionEndsAtNextLine ? safeEnd - 1 : safeEnd;
  const nextBreak = value.indexOf("\n", endProbe);
  const lineEnd = nextBreak < 0 ? value.length : nextBreak;
  const source = value.slice(lineStart, lineEnd);
  const lines = source.split("\n");
  const transformed = lines.map(toggleDescriptionLine).join("\n");
  const nextValue = `${value.slice(0, lineStart)}${transformed}${value.slice(lineEnd)}`;

  if (safeStart !== safeEnd) {
    return { value: nextValue, selectionStart: lineStart, selectionEnd: lineStart + transformed.length };
  }

  const currentLine = value.slice(lineStart, lineEnd);
  const leadingLength = currentLine.length - currentLine.trimStart().length;
  const trimmed = currentLine.trim();
  const wasWrapped = trimmed.startsWith("*") && trimmed.endsWith("*") && trimmed.length >= 2;
  const relative = safeStart - lineStart;
  const openingStarPosition = leadingLength;
  const caretDelta = wasWrapped
    ? relative > openingStarPosition ? -1 : 0
    : trimmed && relative >= openingStarPosition ? 1 : 0;
  const nextCaret = Math.max(lineStart, Math.min(lineStart + transformed.length, safeStart + caretDelta));
  return { value: nextValue, selectionStart: nextCaret, selectionEnd: nextCaret };
}

function toggleDescriptionLine(line: string): string {
  const leading = line.match(/^\s*/)?.[0] ?? "";
  const trailing = line.match(/\s*$/)?.[0] ?? "";
  const content = line.slice(leading.length, line.length - trailing.length);
  if (!content) return line;
  const toggled = content.startsWith("*") && content.endsWith("*") && content.length >= 2
    ? content.slice(1, -1)
    : `*${content}*`;
  return `${leading}${toggled}${trailing}`;
}

function cleanMarkdown(value: string): string {
  return value.replace(/[*_`#]/g, "").replace(/\s+/g, " ").trim();
}

function endingPause(text: string): number {
  if (/(?:……|\.\.\.|――)\s*$/.test(text)) return 900;
  if (/[。！？!?]\s*$/.test(text)) return 300;
  if (/、\s*$/.test(text)) return 140;
  return 220;
}
