import { describe, expect, test } from "bun:test";
import { groupSpeechSegmentsForDisplay, parseMarkdownDisplay, speechBlocksFromSegments, toggleDescription, toggleDescriptionAtSelection } from "./script.ts";

describe("speechBlocksFromSegments", () => {
  test("uses metadata rather than brackets or italics for speaker roles", () => {
    const blocks = speechBlocksFromSegments([
      { text: "「括弧があってもナレーター」", speakerName: "ナレーター", position: "NARRATOR" },
      { text: "イタリックでなければキャラクター", speakerName: "みくる", position: "LEFT" },
    ]);
    expect(blocks.map(({ role, speakerName }) => ({ role, speakerName }))).toEqual([
      { role: "narrator", speakerName: undefined },
      { role: "character", speakerName: "みくる" },
    ]);
  });

  test("treats missing metadata as character instead of inspecting text", () => {
    expect(speechBlocksFromSegments([{ text: "通常文" }])[0]?.role).toBe("character");
  });

  test("splits italic text inside a character segment into narrator and character blocks", () => {
    const blocks = speechBlocksFromSegments([{
      text: "*彼女は振り返った。*\n「どうしたの？」",
      speakerName: "みくる",
      position: "LEFT",
    }]);
    expect(blocks.map(({ role, speakerName, text }) => ({ role, speakerName, text }))).toEqual([
      { role: "narrator", speakerName: undefined, text: "彼女は振り返った。" },
      { role: "character", speakerName: "みくる", text: "「どうしたの？」" },
    ]);
  });

  test("keeps multiple characters in one message as separate ordered blocks", () => {
    const blocks = speechBlocksFromSegments([
      { text: "行こう", speakerName: "アリス", position: "LEFT" },
      { text: "待って", speakerName: "ボブ", position: "RIGHT" },
      { text: "急いで", speakerName: "アリス", position: "LEFT" },
    ]);
    expect(blocks.map(({ role, speakerName, text }) => ({ role, speakerName, text }))).toEqual([
      { role: "character", speakerName: "アリス", text: "行こう" },
      { role: "character", speakerName: "ボブ", text: "待って" },
      { role: "character", speakerName: "アリス", text: "急いで" },
    ]);
  });
});

test("parses italic Markdown for display", () => {
  expect(parseMarkdownDisplay("*雨が降る。*\n\n「帰ろう」")).toEqual([
    { text: "雨が降る。", italic: true },
    { text: "\n\n「帰ろう」", italic: false },
  ]);
});

test("keeps character italics in one UI group while separating different characters", () => {
  const groups = groupSpeechSegmentsForDisplay([
    { text: "*振り返る*\nどうしたの？", speakerName: "アリス", position: "LEFT" },
    { text: "なんでもない", speakerName: "ボブ", position: "RIGHT" },
  ]);
  expect(groups).toHaveLength(2);
  expect(groups[0]?.[0]?.text).toBe("*振り返る*\nどうしたの？");
});

test("description input toggles surrounding asterisks", () => {
  expect(toggleDescription("彼女の手をつかむ")).toBe("*彼女の手をつかむ*");
  expect(toggleDescription("*彼女の手をつかむ*")).toBe("彼女の手をつかむ");
});

describe("toggleDescriptionAtSelection", () => {
  test("toggles only the line containing the caret", () => {
    expect(toggleDescriptionAtSelection("一行目\n二行目\n三行目", 6, 6)).toEqual({
      value: "一行目\n*二行目*\n三行目",
      selectionStart: 7,
      selectionEnd: 7,
    });
  });

  test("toggles every selected line independently", () => {
    expect(toggleDescriptionAtSelection("一行目\n*二行目*\n三行目", 0, 11).value).toBe("*一行目*\n二行目\n*三行目*");
  });
});
