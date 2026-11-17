import { ApiError, type ErrorResponseData, type RefreshPolicy, type TokenPair, type UnknownRecord } from "./types.ts";

export type RefreshTokenFetcher = (body: UnknownRecord) => Promise<UnknownRecord>;

export class AuthManager {
  token?: string;
  refreshToken?: string;
  deviceId?: string;
  private refreshPromise?: Promise<TokenPair>;
  private refreshCredentials?: { refreshToken: string; deviceId?: string };
  private refreshFailure?: { error: unknown; at: number; refreshToken: string; deviceId?: string };
  private readonly policy: Required<RefreshPolicy>;
  private readonly onTokenUpdate?: (tokens: TokenPair) => void | Promise<void>;

  constructor(options: {
    token?: string;
    refreshToken?: string;
    deviceId?: string;
    onTokenUpdate?: (tokens: TokenPair) => void | Promise<void>;
    refreshPolicy?: RefreshPolicy;
  }) {
    this.token = options.token;
    this.refreshToken = options.refreshToken;
    this.deviceId = options.deviceId;
    this.onTokenUpdate = options.onTokenUpdate;
    this.policy = {
      leewayMs: options.refreshPolicy?.leewayMs ?? 30_000,
      maxAttempts: options.refreshPolicy?.maxAttempts ?? 3,
      baseDelayMs: options.refreshPolicy?.baseDelayMs ?? 1_000,
      cooldownMs: options.refreshPolicy?.cooldownMs ?? 5_000,
    };
    for (const [key, value] of Object.entries(this.policy)) {
      if (!Number.isFinite(value) || value < 0 || key === "maxAttempts" && (!Number.isInteger(value) || value < 1)) {
        throw new ApiError(`Invalid refresh policy: ${key}`, { code: "InvalidRefreshPolicy" });
      }
    }
  }

  shouldRefresh(): boolean {
    if (!this.token || !this.refreshToken) return false;
    const expiration = this.expirationTime();
    return expiration !== undefined && expiration <= Date.now() + this.policy.leewayMs;
  }

  canUseCurrentToken(): boolean {
    const expiration = this.expirationTime();
    return expiration !== undefined && expiration > Date.now();
  }

  private expirationTime(): number | undefined {
    if (!this.token) return undefined;
    try {
      const payload = this.token.split(".")[1];
      if (!payload) return undefined;
      const encoded = payload.replace(/-/g, "+").replace(/_/g, "/");
      const decoded = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "="))) as { exp?: unknown };
      return typeof decoded.exp === "number" && Number.isFinite(decoded.exp) ? decoded.exp * 1_000 : undefined;
    } catch {
      return undefined;
    }
  }

  async refresh(fetcher: RefreshTokenFetcher, credentials: { refreshToken?: string; deviceId?: string } = this): Promise<TokenPair> {
    if (!credentials.refreshToken) {
      throw new ApiError("Cannot refresh access token because refreshToken is missing.", { code: "MissingRefreshToken" });
    }
    if (this.refreshPromise) {
      if (this.refreshCredentials?.refreshToken === credentials.refreshToken && this.refreshCredentials.deviceId === credentials.deviceId) {
        return this.refreshPromise;
      }
      await this.refreshPromise.catch(() => {});
      return this.refresh(fetcher, credentials);
    }

    if (this.refreshFailure?.refreshToken === credentials.refreshToken && this.refreshFailure.deviceId === credentials.deviceId
      && Date.now() - this.refreshFailure.at < this.policy.cooldownMs) {
      throw this.refreshFailure.error;
    }

    this.refreshCredentials = { refreshToken: credentials.refreshToken, deviceId: credentials.deviceId };
    this.refreshPromise = this.performRefresh(fetcher, credentials.refreshToken, credentials.deviceId).finally(() => {
      this.refreshPromise = undefined;
      this.refreshCredentials = undefined;
    });

    return this.refreshPromise;
  }

  private async performRefresh(fetcher: RefreshTokenFetcher, refreshToken: string, deviceId?: string): Promise<TokenPair> {
    let raw: UnknownRecord;
    for (let attempt = 0; ; attempt++) {
      try {
        raw = await fetcher({
          type: "refresh",
          refreshToken,
          ...(deviceId ? { deviceId } : {}),
        });
        break;
      } catch (error) {
        if (attempt + 1 >= this.policy.maxAttempts || !retryableRefreshError(error)) {
          this.refreshFailure = { error, at: Date.now(), refreshToken, deviceId };
          throw error;
        }
        const retryAfter = error instanceof ApiError ? error.response?.headers.get("Retry-After") : null;
        const serverDelay = retryAfter ? retryAfterDelay(retryAfter) : 0;
        const delay = Math.min(30_000, Math.max(serverDelay, this.policy.baseDelayMs * 2 ** attempt));
        if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    this.refreshFailure = undefined;
    return this.acceptTokenResponse(raw, { refreshToken });
  }

  async acceptTokenResponse(raw: UnknownRecord, fallback?: { refreshToken?: string }): Promise<TokenPair> {
    const token = raw && typeof raw === "object" ? readString(raw, "accessToken") ?? readString(raw, "token") : undefined;
    if (!token) {
      throw new ApiError("Refresh response did not include accessToken.", {
        code: "InvalidRefreshResponse",
        data: raw,
      });
    }

    const refreshToken = readString(raw, "refreshToken") ?? (fallback ? fallback.refreshToken : this.refreshToken);
    this.token = token;
    this.refreshToken = refreshToken;
    this.refreshFailure = undefined;

    const tokens = { accessToken: token, token, refreshToken };
    await this.onTokenUpdate?.(tokens);
    return tokens;
  }

  setDeviceId(deviceId: string): void {
    this.deviceId = deviceId;
  }

  isTransientRefreshFailure(error: unknown): boolean {
    return this.refreshFailure?.error === error && retryableRefreshError(error);
  }
}

function retryableRefreshError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 408 || error.status === 429 || (error.status !== undefined && error.status >= 500);
  }
  return error instanceof TypeError;
}

function retryAfterDelay(value: string): number {
  const seconds = Number(value);
  return Number.isFinite(seconds) ? Math.max(0, seconds * 1_000) : Math.max(0, Date.parse(value) - Date.now()) || 0;
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
