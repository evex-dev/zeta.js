import { createZetaClient, type ApiResult, type UserLanguage } from "../src/index.ts";

const token = Bun.env.TOKEN;
const refreshToken = Bun.env.REFRESH_TOKEN;

if (!token && !refreshToken) {
  throw new Error("Set TOKEN and REFRESH_TOKEN in api/.env before running the probe.");
}

const client = createZetaClient({
  token,
  refreshToken,
  deviceId: Bun.env.DEVICE_ID,
  userLanguage: parseLanguage(Bun.env.USER_LANGUAGE),
  defaultHeaders: {
    "X-Client-Type": Bun.env.CLIENT_TYPE ?? "app",
    "X-Device-Type": Bun.env.DEVICE_TYPE ?? "android",
    "X-Client-Version": Bun.env.CLIENT_VERSION ?? "3.39.14",
    "X-Client-Native-Version": Bun.env.CLIENT_NATIVE_VERSION ?? "3.39.14",
  },
  onTokenUpdate(tokens) {
    console.log("refresh succeeded", {
      accessToken: Boolean(tokens.accessToken),
      refreshToken: Boolean(tokens.refreshToken),
    });
  },
});

const probes: Array<[string, () => Promise<ApiResult<unknown>>]> = [
  ["users/me", () => client.auth.getMe()],
  ["feature-flags/web-purchase", () => client.featureFlags.getFeatureFlag("web-purchase")],
  ["coin/balance", () => client.coin.getBalance()],
  ["zeta-pass/subscription", () => client.pass.getSubscription()],
  ["announcements", () => client.announcements.listAnnouncements({ limit: 3 })],
  ["infinite-plots", () => client.home.getInfinitePlots({ limit: 16 })],
];

for (const [name, run] of probes) {
  try {
    const result = await run();
    console.log("ok", name, {
      status: result.response.status,
      requestId: result.requestId,
      shape: describeShape(result.data),
    });
  } catch (error) {
    console.error("failed", name, error);
  }
}

function describeShape(data: unknown): string {
  if (Array.isArray(data)) {
    return `array(${data.length})`;
  }

  if (data && typeof data === "object") {
    return `object(${Object.keys(data).slice(0, 5).join(",")})`;
  }

  return typeof data;
}

function parseLanguage(value?: string): UserLanguage | undefined {
  return value === "KOREAN" || value === "JAPANESE" || value === "ENGLISH" ? value : undefined;
}
