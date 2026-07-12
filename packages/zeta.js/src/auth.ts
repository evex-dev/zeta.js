import type { BaseClient } from "./core/client.ts";
import type { ApiResult, TokenPair } from "./core/types.ts";
import type { AnyData, ConnectedExternalPlatformsResponse, LogoutRequest, SsoCodeRequest, User } from "./domainTypes.ts";

export type IssueTokenRequest =
  | { deviceId?: string; type: "anonymous" }
  | { deviceId?: string; type: "external"; externalToken: Record<string, unknown> }
  | { deviceId?: string; type: "oneTimeCode"; code: string }
  | { deviceId?: string; type: "refresh"; refreshToken: string }
  | { deviceId?: string; type: "secretCode"; secretCode: string };

export type TokenResponse = {
  accessToken: string;
  refreshToken?: string;
  [key: string]: unknown;
};

export type SsoCodeResponse = {
  code?: string;
  url?: string;
  expiresAt?: string;
  [key: string]: unknown;
};

export type ConnectedExternalPlatform = AnyData & {
  issuer?: string;
  connectedAt?: string;
};
export class AuthApi {
  constructor(private readonly client: BaseClient) {}

  getMe(): Promise<ApiResult<User>> {
    return this.client.get<User>("/v1/users/me");
  }

  logout(body?: LogoutRequest): Promise<ApiResult<unknown>> {
    return this.client.post("/v1/users/logout", body);
  }

  issueToken(body: IssueTokenRequest): Promise<ApiResult<TokenResponse>> {
    return this.client.post<TokenResponse, IssueTokenRequest>("/v1/auth/tokens", body, { auth: false });
  }

  startAnonymousSession(deviceId: string | undefined = this.client.session.deviceId): Promise<TokenPair> {
    return this.client.startAnonymousSession(deviceId);
  }

  refreshTokens(refreshToken: string | undefined = this.client.refreshToken, deviceId: string | undefined = this.client.session.deviceId): Promise<TokenPair> {
    return this.client.refreshTokens(refreshToken, deviceId);
  }

  getConnectedExternalPlatforms(): Promise<ApiResult<ConnectedExternalPlatformsResponse>> {
    return this.client.get<ConnectedExternalPlatformsResponse>("/v1/auth/connected-external-platforms");
  }

  issueSsoCode(body?: SsoCodeRequest): Promise<ApiResult<SsoCodeResponse>> {
    return this.client.post<SsoCodeResponse, SsoCodeRequest | undefined>("/v1/auth/sso/code", body);
  }
}

export function createAuthApi(client: BaseClient): AuthApi {
  return new AuthApi(client);
}
