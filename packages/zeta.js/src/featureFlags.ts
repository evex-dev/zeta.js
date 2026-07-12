import type { BaseClient } from "./core/client.ts";
import type { ApiResult } from "./core/types.ts";
import type { FeatureFlag } from "./domainTypes.ts";
export class FeatureFlagsApi {
  constructor(private readonly client: BaseClient) {}

  getFeatureFlag(key: string): Promise<ApiResult<FeatureFlag>> {
    return this.client.get<FeatureFlag>(`/v1/feature-flags/:key`, { path: { key } });
  }

  getKnownFeatureFlags(): Promise<ApiResult<Record<string, FeatureFlag> | FeatureFlag[]>> {
    return this.client.get<Record<string, FeatureFlag> | FeatureFlag[]>("/v1/feature-flags");
  }
}

export function createFeatureFlagsApi(client: BaseClient): FeatureFlagsApi {
  return new FeatureFlagsApi(client);
}
