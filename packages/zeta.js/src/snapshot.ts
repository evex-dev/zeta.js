import type { BaseClient } from "./core/client.ts";
import type { ApiResult, JsonObject, QueryParams, RequestOptions } from "./core/types.ts";
import type { StreamEvent } from "./core/stream.ts";
import type {
  AppPushTokenRequest, ChatSendMessageRequest, ChatStreamEvent, ChatOptionsStreamRequest,
  RoomCreateRequest, RoomUpdateRequest, RoomModelSettingUpdateRequest,
  SignupCheckRequest, KeywordTestRequest, PlotSearchV2Query, RoomListQuery,
  NiceAdditionalAuthValidateRequest,
  PlotSearchPage, Room, RoomListResponse, RoomModelSetting, NiceAdditionalAuthResponse,
} from "./domainTypes.ts";
import { snapshotEndpoints, type SnapshotEndpointName } from "./generated/endpoints.ts";
import type { SnapshotDtoMap, SourceValue, SnapshotObservedBodyMap, SnapshotObservedQueryMap } from "./generated/dtos.ts";

export { snapshotEndpoints } from "./generated/endpoints.ts";
export type { SnapshotEndpointName } from "./generated/endpoints.ts";
export type { SnapshotDto, SnapshotDtoMap, SnapshotDtoName, SourceValue, SnapshotObservedBodyMap, SnapshotObservedQueryMap } from "./generated/dtos.ts";

type Contract<N extends SnapshotEndpointName> = typeof snapshotEndpoints[N];
type ContractKey<N extends SnapshotEndpointName> = `${Contract<N>["method"]} ${Contract<N>["path"]}`;
type PathNames<Path extends string> = Path extends `${string}:${infer Parameter}/${infer Rest}`
  ? Parameter | PathNames<Rest> : Path extends `${string}:${infer Parameter}` ? Parameter : never;

/** Recovered request shapes. Other erased JSON payloads accept JSON objects. */
export type SnapshotBodyMap = {
  chat: ChatSendMessageRequest;
  option: ChatOptionsStreamRequest;
  optionRegen: ChatOptionsStreamRequest;
  createRoom: RoomCreateRequest;
  updateRoom: RoomUpdateRequest;
  updateRoomModelSetting: RoomModelSettingUpdateRequest;
  checkSignup: SignupCheckRequest;
  createOrUpdateAppPushToken: AppPushTokenRequest;
  testKeyword: KeywordTestRequest;
};

export type SnapshotQueryMap = {
  searchPlotV2: PlotSearchV2Query;
  getPlotCountByKeywordV2: PlotSearchV2Query;
  getSearchAutocompleteV2: PlotSearchV2Query;
  listRoomsV2: RoomListQuery;
  validateNiceAdditionalAuth: NiceAdditionalAuthValidateRequest;
};

/** Shapes whose cardinality is established by the saved consuming code. */
export type SnapshotResponseMap = {
  getRoom: Room;
  createRoom: Room;
  listRoomsV2: RoomListResponse;
  searchPlotV2: PlotSearchPage;
  getRoomModelSetting: RoomModelSetting;
  updateRoomModelSetting: RoomModelSetting;
  requestNiceAdditionalAuth: NiceAdditionalAuthResponse;
};

/** responseClass alone does not prove whether the JSON root is a scalar or array. */
export type SnapshotResponse<N extends SnapshotEndpointName> = N extends keyof SnapshotResponseMap ? SnapshotResponseMap[N]
  : Contract<N>["response"] extends keyof SnapshotDtoMap
  ? SourceValue<SnapshotDtoMap[Contract<N>["response"] & keyof SnapshotDtoMap]> : unknown;

type Body<N extends SnapshotEndpointName> = Contract<N>["multipart"] extends true ? FormData
  : N extends keyof SnapshotBodyMap ? SnapshotBodyMap[N]
  : ContractKey<N> extends keyof SnapshotObservedBodyMap ? SnapshotObservedBodyMap[ContractKey<N>] : JsonObject;
type PathInput<N extends SnapshotEndpointName> = [PathNames<Contract<N>["path"]>] extends [never]
  ? { path?: never } : { path: { [P in PathNames<Contract<N>["path"]>]: string | number } };

type QueryInput<N extends SnapshotEndpointName> = N extends keyof SnapshotQueryMap
  ? {} extends SnapshotQueryMap[N] ? { query?: SnapshotQueryMap[N] } : { query: SnapshotQueryMap[N] }
  : ContractKey<N> extends keyof SnapshotObservedQueryMap ? { query?: SnapshotObservedQueryMap[ContractKey<N>] }
  : { query?: QueryParams };
type BodyInput<N extends SnapshotEndpointName> = Contract<N>["method"] extends "GET" ? { body?: never }
  : Contract<N>["multipart"] extends true ? { body: FormData }
  : N extends keyof SnapshotBodyMap ? {} extends Body<N> ? { body?: Body<N> } : { body: Body<N> }
  : { body?: Body<N> };

export type SnapshotRequest<N extends SnapshotEndpointName> = Omit<RequestOptions<Body<N>>, "path" | "query" | "multipart" | "body">
  & PathInput<N>
  & QueryInput<N> & BodyInput<N>;

export type SnapshotResult<N extends SnapshotEndpointName> = Contract<N>["stream"] extends true
  ? Promise<AsyncGenerator<StreamEvent<ChatStreamEvent>>> : Promise<ApiResult<SnapshotResponse<N>>>;
type SnapshotMethod<N extends SnapshotEndpointName> = {} extends SnapshotRequest<N>
  ? (options?: SnapshotRequest<N>) => SnapshotResult<N> : (options: SnapshotRequest<N>) => SnapshotResult<N>;

/** Named, typed wrappers for every service endpoint in the saved clients. */
export type SnapshotApi = { readonly [N in SnapshotEndpointName]: SnapshotMethod<N> };

export function createSnapshotApi(client: BaseClient): SnapshotApi {
  const api: Record<string, (options?: RequestOptions) => unknown> = {};
  for (const [name, endpoint] of Object.entries(snapshotEndpoints)) {
    api[name] = (options = {}) => {
      const requestOptions = { ...options, multipart: endpoint.multipart };
      if (endpoint.stream) return client.stream(endpoint.path, options.body, requestOptions);
      return client.request(endpoint.method, endpoint.path, requestOptions);
    };
  }
  return api as unknown as SnapshotApi;
}
