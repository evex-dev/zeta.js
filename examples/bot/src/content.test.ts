import { describe, expect, test } from "bun:test";
import { messageToText, plotPersona, replaceDiscordUserMentions, replaceProfileNamePlaceholder, streamEventToText, stripBotMentions } from "./content.ts";

describe("content helpers", () => {
  test("strips bot mentions and normalizes whitespace", () => {
    expect(stripBotMentions("<@123>  hello   world <@!123>", "123")).toBe("hello world");
  });

  test("replaces profile name placeholders", () => {
    expect(replaceProfileNamePlaceholder("Hi __--profileName__. Bye __--profileName__.", "Kozika")).toBe("Hi Kozika. Bye Kozika.");
  });

  test("replaces discord user mentions with display names", () => {
    expect(replaceDiscordUserMentions("hi <@123> and <@!456>", (id) => ({ "123": "Alice", "456": "Bob" })[id])).toBe("hi @Alice and @Bob");
  });

  test("extracts plot persona from plot and character fallback", () => {
    expect(plotPersona({
      characters: [{ name: "Alice", imageUrl: "https://example.test/alice.png" }],
    })).toEqual({
      name: "Alice",
      avatarUrl: "https://example.test/alice.png",
    });
  });

  test("extracts text from message contents", () => {
    expect(messageToText({
      contents: [
        { type: "TEXT", text: "Hello" },
        { type: "TEXT", text: "there" },
      ],
    })).toBe("Hello\nthere");
  });

  test("recognizes complete stream replies", () => {
    expect(streamEventToText({
      event: "CHAT_COMPLETE",
      replyMessage: { text: "Done" },
      chunkMessage: { contents: [{ text: "partial" }] },
    })).toEqual({ complete: true, text: "Done" });
  });
});
