import { rename } from "node:fs/promises";
import { createZetaClient, type UserLanguage } from "../index.ts";

type ZetaCredentialFile = {
  token: string;
  refresh_token: string;
  device_id: string;
};

const credentialsPath = Bun.env.ZETA_CREDENTIALS!;
const credentials = await Bun.file(credentialsPath).json() as ZetaCredentialFile;

const client = createZetaClient({
  token: credentials.token,
  refreshToken: credentials.refresh_token,
  deviceId: credentials.device_id,
  userLanguage: parseLanguage(Bun.env.USER_LANGUAGE) ?? "JAPANESE",
  async onTokenUpdate(tokens) {
    await persistTokens(credentialsPath, credentials, tokens);
    console.log(JSON.stringify({
      step: "token-refresh",
      accessToken: Boolean(tokens.accessToken),
      refreshToken: Boolean(tokens.refreshToken),
    }));
  },
});

const roomId = Bun.env.PROBE_ROOM_ID ?? await resolveRoomId();
const speakers = await client.baseClient.talk.getSpeakerProfiles(roomId);

console.log(JSON.stringify({
  step: "speakers",
  roomId,
  count: speakers.length,
  speakers: speakers.map((speaker) => ({
    id: speaker.id,
    name: speaker.name,
    hasImageUrl: Boolean(speaker.imageUrl),
    source: speaker.source,
  })),
}, null, 2));

async function resolveRoomId(): Promise<string> {
  const rooms = await client.talk.list({ limit: 1 });
  const room = rooms.data.rooms[0];
  const id = room?.id ?? room?.roomId;
  if (!id) {
    throw new Error("No room found. Set PROBE_ROOM_ID.");
  }
  return id;
}

function parseLanguage(value?: string): UserLanguage | undefined {
  return value === "KOREAN" || value === "JAPANESE" || value === "ENGLISH" ? value : undefined;
}

async function persistTokens(path: string, previous: ZetaCredentialFile, tokens: { accessToken: string; refreshToken?: string }): Promise<void> {
  const next: ZetaCredentialFile = {
    token: tokens.accessToken,
    refresh_token: tokens.refreshToken ?? previous.refresh_token,
    device_id: previous.device_id,
  };

  await Bun.write(`${path}.tmp`, `${JSON.stringify(next, null, 2)}\n`);
  await rename(`${path}.tmp`, path);
}
