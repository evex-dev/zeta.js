import { AuthManager, isAuthExpired } from "./auth.ts";
import { readEventStream, type StreamEvent } from "./stream.ts";
import { AnnouncementsApi } from "../announcements.ts";
import { AppApi } from "../app.ts";
import { AuthApi } from "../auth.ts";
import { CoinApi } from "../coin.ts";
import { CreatorApi } from "../creator.ts";
import { FeatureFlagsApi } from "../featureFlags.ts";
import { HomeApi } from "../home.ts";
import { LorebooksApi } from "../lorebooks.ts";
import { PassApi } from "../pass.ts";
import { PlotsApi } from "../plots.ts";
import { ProfileApi } from "../profile.ts";
import { RankingApi } from "../ranking.ts";
import { SearchApi } from "../search.ts";
import { TalkApi } from "../talk.ts";
import {
  ApiError,
  type ApiResult,
  type DeviceType,
  type ErrorResponseData,
  type FetchLike,
  type HttpMethod,
  type QueryParams,
  type RequestOptions,
  type TokenPair,
  type UnknownRecord,
  type BaseClientOptions,
} from "./types.ts";

export const DEFAULT_BASE_URL = "https://api.zeta-ai.io";
const DEFAULT_CLIENT_VERSION = "3.39.14";
const WEB_CLIENT_VERSION = "3.39.17";

export class BaseClient {
  readonly baseUrl: string;
  readonly session: AuthManager;
  readonly auth = new AuthApi(this);
  readonly featureFlags = new FeatureFlagsApi(this);
  readonly home = new HomeApi(this);
  readonly ranking = new RankingApi(this);
  readonly announcements = new AnnouncementsApi(this);
  readonly app = new AppApi(this);
  readonly search = new SearchApi(this);
  readonly talk = new TalkApi(this);
  readonly plots = new PlotsApi(this);
  readonly lorebooks = new LorebooksApi(this);
  readonly profile = new ProfileApi(this);
  readonly creator = new CreatorApi(this);
  readonly coin = new CoinApi(this);
  readonly pass = new PassApi(this);
  private readonly defaultHeaders = new Headers();
  private readonly fetchImpl: FetchLike;

  constructor(options: BaseClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetchImpl = options.fetch ?? fetch;
    this.session = new AuthManager({
      token: options.token,
      refreshToken: options.refreshToken,
      deviceId: options.deviceId,
      onTokenUpdate: options.onTokenUpdate,
    });

    const clientType = options.clientType ?? "app";
    const deviceType = options.deviceType ?? "android";
    const clientVersion = options.clientVersion ?? DEFAULT_CLIENT_VERSION;
    const nativeClientVersion = options.clientNativeVersion ?? clientVersion;

    this.defaultHeaders.set("X-Client-Type", clientType);
    this.defaultHeaders.set("X-Device-Type", deviceType);
    this.defaultHeaders.set("X-User-Language", options.userLanguage?.toUpperCase() ?? "ENGLISH");
    this.defaultHeaders.set("X-Client-Version", clientVersion);
    this.defaultHeaders.set("X-Client-Native-Version", nativeClientVersion);

    if (options.deviceId) {
      this.defaultHeaders.set("X-Sticky", options.deviceId);
    }

    mergeHeaders(this.defaultHeaders, options.defaultHeaders);
  }

  get token(): string | undefined {
    return this.session.token;
  }

  get refreshToken(): string | undefined {
    return this.session.refreshToken;
  }

  request<T = unknown, TBody = unknown>(
    method: HttpMethod,
    path: string,
    options: RequestOptions<TBody> = {},
  ): Promise<ApiResult<T>> {
    return this.send<T, TBody>(method, path, options, true);
  }

  get<T = unknown>(path: string, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>("GET", path, options);
  }

  post<T = unknown, TBody = unknown>(path: string, body?: TBody, options: RequestOptions<TBody> = {}): Promise<ApiResult<T>> {
    return this.request<T, TBody>("POST", path, { ...options, body });
  }

  put<T = unknown, TBody = unknown>(path: string, body?: TBody, options: RequestOptions<TBody> = {}): Promise<ApiResult<T>> {
    return this.request<T, TBody>("PUT", path, { ...options, body });
  }

  patch<T = unknown, TBody = unknown>(path: string, body?: TBody, options: RequestOptions<TBody> = {}): Promise<ApiResult<T>> {
    return this.request<T, TBody>("PATCH", path, { ...options, body });
  }

  delete<T = unknown>(path: string, options?: RequestOptions): Promise<ApiResult<T>> {
    return this.request<T>("DELETE", path, options);
  }

  async refreshTokens(refreshToken = this.session.refreshToken, deviceId = this.session.deviceId): Promise<TokenPair> {
    if (!refreshToken) {
      throw new ApiError("Cannot refresh access token because refreshToken is missing.", {
        code: "MissingRefreshToken",
      });
    }

    const response = await this.fetchImpl(`${this.baseUrl}/v1/auth/tokens`, {
      method: "POST",
      headers: this.buildHeaders({ auth: false, body: {} }),
      body: JSON.stringify({
        type: "refresh",
        refreshToken,
        ...(deviceId ? { deviceId } : {}),
      }),
    });
    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw toApiError(response, data, "Refresh token request failed.");
    }

    return this.session.acceptTokenResponse(data as UnknownRecord);
  }

  async startAnonymousSession(deviceId = this.ensureDeviceId()): Promise<TokenPair> {
    this.setDeviceId(deviceId);

    const body = { type: "anonymous", deviceId } as const;
    const response = await this.fetchImpl(`${this.baseUrl}/v1/auth/tokens`, {
      method: "POST",
      headers: this.buildHeaders({ auth: false, body }),
      body: JSON.stringify(body),
    });
    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw toApiError(response, data, "Anonymous token request failed.");
    }

    return this.session.acceptTokenResponse(data as UnknownRecord);
  }

  async stream<T = unknown, TBody = unknown>(
    path: string,
    body?: TBody,
    options: RequestOptions<TBody> = {},
  ): Promise<AsyncGenerator<StreamEvent<T>>> {
    const response = await this.fetchStream(path, body, options, true);
    return readEventStream<T>(response);
  }

  buildUrl(path: string, options: Pick<RequestOptions, "path" | "query"> = {}): string {
    const interpolated = interpolatePath(path, options.path);
    const suffix = serializeQuery(options.query);
    return `${this.baseUrl}${interpolated}${suffix ? `?${suffix}` : ""}`;
  }

  private async send<T, TBody>(
    method: HttpMethod,
    path: string,
    options: RequestOptions<TBody>,
    allowRefreshRetry: boolean,
  ): Promise<ApiResult<T>> {
    const response = await this.fetchImpl(this.buildUrl(path, options), {
      method,
      headers: this.buildHeaders(options),
      body: buildBody(options),
      signal: options.signal,
    });
    const data = await parseResponseBody(response);

    if (!response.ok) {
      if (allowRefreshRetry && options.auth !== false && options.retryOnAuthExpired !== false && isAuthExpired(response.status, data)) {
        await this.refreshAccessToken();
        return this.send<T, TBody>(method, path, options, false);
      }

      throw toApiError(response, data);
    }

    return {
      data: data as T,
      response,
      requestId: getRequestId(response),
    };
  }

  private async fetchStream<TBody>(
    path: string,
    body: TBody | undefined,
    options: RequestOptions<TBody>,
    allowRefreshRetry: boolean,
  ): Promise<Response> {
    const response = await this.fetchImpl(this.buildUrl(path, options), {
      method: "POST",
      headers: this.buildHeaders({
        ...options,
        body,
        headers: mergeHeadersObject(options.headers, { Accept: "text/event-stream" }),
      }),
      body: buildBody({ ...options, body }),
      signal: options.signal,
    });

    if (response.ok) {
      return response;
    }

    const data = await parseResponseBody(response.clone());
    if (allowRefreshRetry && options.auth !== false && options.retryOnAuthExpired !== false && isAuthExpired(response.status, data)) {
      await this.refreshAccessToken();
      return this.fetchStream(path, body, options, false);
    }

    throw toApiError(response, data);
  }

  private async refreshAccessToken(): Promise<void> {
    await this.session.refresh((body) => this.fetchRefreshTokens(body));
  }

  private async fetchRefreshTokens(body: UnknownRecord): Promise<UnknownRecord> {
    const response = await this.fetchImpl(`${this.baseUrl}/v1/auth/tokens`, {
      method: "POST",
      headers: this.buildHeaders({ auth: false, body }),
      body: JSON.stringify(body),
    });
    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw toApiError(response, data, "Refresh token request failed.");
    }

    return data as UnknownRecord;
  }

  private ensureDeviceId(): string {
    return this.session.deviceId ?? crypto.randomUUID();
  }

  private setDeviceId(deviceId: string): void {
    this.session.setDeviceId(deviceId);
    this.defaultHeaders.set("X-Sticky", deviceId);
  }

  private buildHeaders(options: RequestOptions): Headers {
    const headers = new Headers(this.defaultHeaders);
    mergeHeaders(headers, options.headers);

    if (options.auth !== false && this.session.token) {
      headers.set("Authorization", `Bearer ${this.session.token}`);
    }

    if (options.multipart) {
      headers.delete("Content-Type");
    } else if (options.body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return headers;
  }
}

export function webClientOptions<T extends BaseClientOptions>(options: T = {} as T): T & {
  clientType: "web";
  deviceType: DeviceType;
  clientVersion: string;
  clientNativeVersion: string;
} {
  return {
    ...options,
    clientType: "web",
    deviceType: options.deviceType ?? "pc_web",
    clientVersion: options.clientVersion ?? WEB_CLIENT_VERSION,
    clientNativeVersion: options.clientNativeVersion ?? options.clientVersion ?? WEB_CLIENT_VERSION,
  };
}

export function interpolatePath(path: string, params: Record<string, string | number> = {}): string {
  return path.replace(/:([A-Za-z0-9_]+)/g, (match, key: string) => {
    const value = params[key];
    if (value === undefined || value === null) {
      throw new ApiError(`Missing path parameter: ${key}`, { code: "MissingPathParameter" });
    }
    return encodeURIComponent(String(value));
  });
}

export function serializeQuery(query?: QueryParams): string {
  if (!query) {
    return "";
  }

  const parts: string[] = [];
  appendQuery(parts, "", query);
  return parts.join("&");
}

function appendQuery(parts: string[], prefix: string, value: unknown): void {
  if (value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    const primitives = value.filter((item) => item !== undefined && item !== null).map(String);
    if (primitives.length > 0) {
      parts.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(primitives.join(","))}`);
    }
    return;
  }

  if (value && typeof value === "object" && !(value instanceof Date) && !(value instanceof Blob) && !(value instanceof File)) {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      appendQuery(parts, prefix ? `${prefix}.${key}` : key, nested);
    }
    return;
  }

  if (value === null) {
    parts.push(`${encodeURIComponent(prefix)}=`);
    return;
  }

  parts.push(`${encodeURIComponent(prefix)}=${encodeURIComponent(String(value))}`);
}

function buildBody(options: RequestOptions): BodyInit | undefined {
  if (options.body === undefined) {
    return undefined;
  }

  if (options.multipart) {
    return toFormData(options.body);
  }

  if (
    typeof options.body === "string" ||
    options.body instanceof Blob ||
    options.body instanceof FormData ||
    options.body instanceof URLSearchParams ||
    options.body instanceof ArrayBuffer
  ) {
    return options.body;
  }

  return JSON.stringify(options.body);
}

function toFormData(body: unknown): FormData {
  if (body instanceof FormData) {
    return body;
  }

  const form = new FormData();
  if (!body || typeof body !== "object") {
    return form;
  }

  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        appendFormValue(form, key, item);
      }
    } else {
      appendFormValue(form, key, value);
    }
  }

  return form;
}

function appendFormValue(form: FormData, key: string, value: unknown): void {
  if (value === undefined || value === null) {
    return;
  }

  if (value instanceof Blob) {
    form.append(key, value);
  } else if (typeof value === "object") {
    form.append(key, JSON.stringify(value));
  } else {
    form.append(key, String(value));
  }
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return undefined;
  }

  const text = await response.text();
  if (!text) {
    return undefined;
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json") || looksLikeJson(text)) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

function looksLikeJson(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function toApiError(response: Response, data: unknown, fallback = "API request failed."): ApiError {
  const errorData = data && typeof data === "object" ? data as ErrorResponseData : undefined;
  return new ApiError(errorData?.message ?? response.statusText ?? fallback, {
    status: response.status,
    code: errorData?.code,
    data,
    response,
    requestId: getRequestId(response),
  });
}

function getRequestId(response: Response): string | undefined {
  return response.headers.get("x-request-id") ?? response.headers.get("x-correlation-id") ?? undefined;
}

function mergeHeaders(target: Headers, source?: HeadersInit): void {
  if (!source) {
    return;
  }

  new Headers(source).forEach((value, key) => {
    target.set(key, value);
  });
}

function mergeHeadersObject(source: HeadersInit | undefined, patch: Record<string, string>): Headers {
  const headers = new Headers(source);
  for (const [key, value] of Object.entries(patch)) {
    headers.set(key, value);
  }
  return headers;
}
