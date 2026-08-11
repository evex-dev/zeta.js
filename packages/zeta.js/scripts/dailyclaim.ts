import { createZetaClient, type UserLanguage } from "../index.ts";

const token = Bun.env.ZETA_TOKEN ?? Bun.env.TOKEN;
const refreshToken = Bun.env.REFRESH_TOKEN;

if (!token && !refreshToken) {
  console.error("token required: set ZETA_TOKEN or TOKEN, or set REFRESH_TOKEN");
  process.exit(2);
}

const client = createZetaClient({
  token,
  refreshToken,
  deviceId: Bun.env.DEVICE_ID,
  userLanguage: parseLanguage(Bun.env.USER_LANGUAGE) ?? "JAPANESE",
  defaultHeaders: {
    Accept: "application/json",
    "Accept-Language": Bun.env.ACCEPT_LANGUAGE ?? "ja-JP",
    "User-Agent": Bun.env.USER_AGENT ?? "zeta/408 (iPhone; iOS 18.0)",
    ...(Bun.env.CLIENT_TYPE ? { "X-Client-Type": Bun.env.CLIENT_TYPE } : {}),
    ...(Bun.env.DEVICE_TYPE ? { "X-Device-Type": Bun.env.DEVICE_TYPE } : {}),
    ...(Bun.env.CLIENT_VERSION ? { "X-Client-Version": Bun.env.CLIENT_VERSION } : {}),
    ...(Bun.env.CLIENT_NATIVE_VERSION ? { "X-Client-Native-Version": Bun.env.CLIENT_NATIVE_VERSION } : {}),
  },
  onTokenUpdate(tokens) {
    console.error("refresh succeeded", {
      accessToken: Boolean(tokens.accessToken),
      refreshToken: Boolean(tokens.refreshToken),
    });
  },
});

try {
  const summary = await client.coin.claimDailyRewards({});
  console.log("leftAttempts", summary.leftAttemptsBefore);

  for (const attempt of summary.attempts) {
    console.log(`claim[${attempt.index}]`, 200, attempt.reward);
  }

  console.log("claimed", summary.claimed);
  console.log("balance", 200, summary.balance);
  console.log("leftAttemptsAfter", 200, { leftAttempts: summary.leftAttemptsAfter });
} catch (error) {
  console.error("daily claim failed:", error);
  process.exit(1);
}

function parseLanguage(value?: string): UserLanguage | undefined {
  return value === "KOREAN" || value === "JAPANESE" || value === "ENGLISH" ? value : undefined;
}
