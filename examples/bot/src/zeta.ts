import { rename } from "node:fs/promises";
import { ZetaClient, type TokenPair, type UserLanguage } from "@evex/zeta";

type ZetaCredentialFile = {
  token: string;
  refresh_token: string;
  device_id: string;
};

export async function createConfiguredZetaClient(configPath = "data/zeta.json"): Promise<ZetaClient> {
  const credentials = await readCredentials(configPath);

  return new ZetaClient({
    token: credentials.token,
    refreshToken: credentials.refresh_token,
    deviceId: credentials.device_id,
    userLanguage: "JAPANESE",
    onTokenUpdate: async (tokens) => {
      await writeCredentials(configPath, credentials, tokens);
    },
  });
}

async function readCredentials(path: string): Promise<ZetaCredentialFile> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    throw new Error(`Zeta credential file not found: ${path}`);
  }

  return await file.json() as ZetaCredentialFile;
}

async function writeCredentials(path: string, previous: ZetaCredentialFile, tokens: TokenPair): Promise<void> {
  const next: ZetaCredentialFile = {
    token: tokens.accessToken,
    refresh_token: tokens.refreshToken ?? previous.refresh_token,
    device_id: previous.device_id,
  };

  const tempPath = `${path}.tmp`;
  await Bun.write(tempPath, `${JSON.stringify(next, null, 2)}\n`);
  await rename(tempPath, path);

  previous.token = next.token;
  previous.refresh_token = next.refresh_token;
}
