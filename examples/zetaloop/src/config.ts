import { dirname } from "node:path";
import { rename } from "node:fs/promises";
import { ZetaClient, type TokenPair, type UserLanguage } from "zeta.js";

export type ZetaCredentialFile = {
  token: string;
  refresh_token: string;
  device_id: string;
};

export const credentialPath = Bun.env.ZETA_CREDENTIALS ?? "data/zeta.json";
export const statePath = Bun.env.ZETALOOP_STATE ?? "data/state.json";

export async function createConfiguredZetaClient(configPath = credentialPath): Promise<ZetaClient> {
  const credentials = await readCredentials(configPath);

  return new ZetaClient({
    token: credentials.token,
    refreshToken: credentials.refresh_token,
    deviceId: credentials.device_id,
    userLanguage: languageFromEnv(),
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

  await ensureDirectory(dirname(path));
  const tempPath = `${path}.tmp`;
  await Bun.write(tempPath, `${JSON.stringify(next, null, 2)}\n`);
  await rename(tempPath, path);

  previous.token = next.token;
  previous.refresh_token = next.refresh_token;
}

export async function writeJsonFile(path: string, value: unknown): Promise<void> {
  await ensureDirectory(dirname(path));
  await Bun.write(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function ensureDirectory(path: string): Promise<void> {
  await Bun.$`mkdir -p ${path}`.quiet();
}

function languageFromEnv(): UserLanguage {
  const value = Bun.env.ZETA_USER_LANGUAGE?.toUpperCase();
  if (value === "KOREAN" || value === "JAPANESE" || value === "ENGLISH") {
    return value;
  }
  return "JAPANESE";
}
