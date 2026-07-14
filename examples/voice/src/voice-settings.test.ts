import { expect, test } from "bun:test";
import { migrateVoiceSetting } from "./voice-settings.ts";
import type { VoiceSetting, VoicevoxSpeaker } from "./types.ts";

const fallback: VoiceSetting = {
  speakerId: "fallback-uuid",
  styleId: 2,
  speakerName: "四国めたん",
  styleName: "ノーマル",
  speedScale: 1,
  pitchScale: 0,
  intonationScale: 1,
  volumeScale: 1,
};
const speakers: VoicevoxSpeaker[] = [{
  name: "四国めたん",
  speakerUuid: "metan-uuid",
  styles: [{ id: 2, name: "ノーマル" }],
}];

test("migrates the old numeric speakerId into styleId and restores the speaker UUID", () => {
  const migrated = migrateVoiceSetting({ speakerId: 2, speedScale: 0.9 }, fallback, speakers);
  expect(migrated.speakerId).toBe("metan-uuid");
  expect(migrated.styleId).toBe(2);
  expect(migrated.speedScale).toBe(0.9);
});

test("fills missing voice fields from defaults", () => {
  expect(migrateVoiceSetting({}, fallback, speakers)).toEqual(fallback);
});
