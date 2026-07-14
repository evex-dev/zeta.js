import { expect, test } from "bun:test";
import type { Message } from "@evex/zeta";
import { messageDirection, messageSegments } from "./zeta.ts";

test("uses sender.type instead of message array position", () => {
  const bot = { sender: { id: "BOT-1", type: "BOT" }, isIntro: true } satisfies Message;
  const user = { sender: { id: "USER-1", type: "USER" } } satisfies Message;
  expect(messageDirection(bot, 0)).toBe("assistant");
  expect(messageDirection(user, 1)).toBe("user");
});

test("keeps Zeta speaker and narrator metadata", () => {
  const segments = messageSegments({
    contents: [
      { text: "雨が降る。", speakerName: "ナレーター", position: "NARRATOR" },
      { text: "帰ろう", speakerName: "みくる", position: "LEFT" },
    ],
  });
  expect(segments).toEqual([
    { text: "雨が降る。", speakerName: "ナレーター", position: "NARRATOR" },
    { text: "帰ろう", speakerName: "みくる", position: "LEFT" },
  ]);
});
