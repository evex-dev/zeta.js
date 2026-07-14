export type NarrationMode = "read" | "effects" | "display";

export type VoiceRole = "narrator" | "character";

export type SpeechBlock = {
  id: string;
  role: VoiceRole;
  speakerName?: string;
  text: string;
  sourceText: string;
  pauseBeforeMs: number;
  pauseAfterMs: number;
  volumeScale: number;
};

export type SpeechSegment = {
  text: string;
  speakerName?: string;
  position?: string;
};

export type ScriptResult = {
  blocks: SpeechBlock[];
  displayOnly: string[];
};

export type VoiceSetting = {
  speakerId: string;
  styleId: number;
  speakerName: string;
  styleName: string;
  speedScale: number;
  pitchScale: number;
  intonationScale: number;
  volumeScale: number;
};

export type CastMember = {
  key: string;
  label: string;
  characterName?: string;
  voice: VoiceSetting;
};

export type VoicevoxStyle = { id: number; name: string; type?: string };
export type VoicevoxSpeaker = { name: string; speakerUuid: string; styles: VoicevoxStyle[] };

export type SynthesisRequest = {
  messageId: string;
  text: string;
  voice: VoiceSetting;
};
