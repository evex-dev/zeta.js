export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Primitive = string | number | boolean | null | undefined;
export type QueryValue = Primitive | Primitive[] | QueryObject | QueryObject[];
export interface QueryObject {
  [key: string]: QueryValue;
}
export type QueryParams = QueryObject;
export type UnknownRecord = Record<string, unknown>;
export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export type UserLanguage = "KOREAN" | "JAPANESE" | "ENGLISH";
export type ClientType = "app" | "web" | (string & {});
export type DeviceType = "android" | "ios" | "web" | "pc_web" | (string & {});

export type CursorQuery = {
  limit?: number;
  cursor?: string;
  [key: string]: QueryValue;
};

export type CursorPage<T = unknown> = {
  items?: T[];
  data?: T[];
  cursor?: string | null;
  nextCursor?: string | null;
  hasNext?: boolean;
  [key: string]: unknown;
};

export type TokenPair = {
  accessToken: string;
  token: string;
  refreshToken?: string;
};

export type ZetaClientOptions = {
  baseUrl?: string;
  token?: string;
  refreshToken?: string;
  deviceId?: string;
  clientType?: ClientType;
  deviceType?: DeviceType;
  clientVersion?: string;
  clientNativeVersion?: string;
  userLanguage?: UserLanguage;
  defaultHeaders?: HeadersInit;
  fetch?: FetchLike;
  onTokenUpdate?: (tokens: TokenPair) => void | Promise<void>;
};

export type BaseClientOptions = ZetaClientOptions;

export type RequestOptions<TBody = unknown> = {
  path?: Record<string, string | number>;
  query?: QueryParams;
  body?: TBody;
  headers?: HeadersInit;
  auth?: boolean;
  multipart?: boolean;
  retryOnAuthExpired?: boolean;
  signal?: AbortSignal;
};

export type ApiResult<T> = {
  data: T;
  response: Response;
  requestId?: string;
};

export type ErrorResponseData = {
  code?: string;
  message?: string;
  [key: string]: unknown;
};

export class ApiError<TData = unknown> extends Error {
  override readonly name = "ApiError";
  readonly status?: number;
  readonly code?: string;
  readonly data?: TData;
  readonly response?: Response;
  readonly requestId?: string;

  constructor(message: string, options: {
    status?: number;
    code?: string;
    data?: TData;
    response?: Response;
    requestId?: string;
    cause?: unknown;
  } = {}) {
    super(message, { cause: options.cause });
    this.status = options.status;
    this.code = options.code;
    this.data = options.data;
    this.response = options.response;
    this.requestId = options.requestId;
  }
}
