import { ApiError, type ErrorResponseData, type TokenPair, type UnknownRecord } from "./types.ts";

export type RefreshTokenFetcher = (body: UnknownRecord) => Promise<UnknownRecord>;

export class AuthManager {
  token?: string;
  refreshToken?: string;
  deviceId?: string;
  private refreshPromise?: Promise<TokenPair>;
  private readonly onTokenUpdate?: (tokens: TokenPair) => void | Promise<void>;

  constructor(options: {
    token?: string;
    refreshToken?: string;
    deviceId?: string;
    onTokenUpdate?: (tokens: TokenPair) => void | Promise<void>;
  }) {
    this.token = options.token;
    this.refreshToken = options.refreshToken;
    this.deviceId = options.deviceId;
    this.onTokenUpdate = options.onTokenUpdate;
  }

  async refresh(fetcher: RefreshTokenFetcher): Promise<TokenPair> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      throw new ApiError("Cannot refresh access token because refreshToken is missing.", {
        code: "MissingRefreshToken",
      });
    }

    this.refreshPromise = this.performRefresh(fetcher).finally(() => {
      this.refreshPromise = undefined;
    });

    return this.refreshPromise;
  }

  private async performRefresh(fetcher: RefreshTokenFetcher): Promise<TokenPair> {
    const raw = await fetcher({
      type: "refresh",
      refreshToken: this.refreshToken,
      ...(this.deviceId ? { deviceId: this.deviceId } : {}),
    });

    return this.acceptTokenResponse(raw);
  }

  async acceptTokenResponse(raw: UnknownRecord): Promise<TokenPair> {
    const token = readString(raw, "accessToken") ?? readString(raw, "token");
    if (!token) {
      throw new ApiError("Refresh response did not include accessToken.", {
        code: "InvalidRefreshResponse",
        data: raw,
      });
    }

    const refreshToken = readString(raw, "refreshToken") ?? this.refreshToken;
    this.token = token;
    this.refreshToken = refreshToken;

    const tokens = { accessToken: token, token, refreshToken };
    await this.onTokenUpdate?.(tokens);
    return tokens;
  }

  setDeviceId(deviceId: string): void {
    this.deviceId = deviceId;
  }
}

export function isAuthExpired(status: number, data: unknown): boolean {
  if (status !== 401) {
    return false;
  }

  if (!data || typeof data !== "object") {
    return false;
  }

  const code = (data as ErrorResponseData).code;
  return code === "AuthExpired" || code === "AUTH_EXPIRED";
}

function readString(source: UnknownRecord, key: string): string | undefined {
  const value = source[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
