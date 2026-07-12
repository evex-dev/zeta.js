import type { BaseClient } from "./core/client.ts";
import type { ApiResult } from "./core/types.ts";
import type {
  BannerListResponse,
  InfinitePlotsResponse,
  LayoutQuery,
  LayoutResponse,
  LayoutSection,
  LayoutSectionResponse,
  PlotListQuery,
  PopupListResponse,
} from "./domainTypes.ts";
export class HomeApi {
  constructor(private readonly client: BaseClient) {}

  getInfinitePlots(query?: PlotListQuery): Promise<ApiResult<InfinitePlotsResponse>> {
    return this.client.get<InfinitePlotsResponse>("/v1/infinite-plots", { query });
  }

  getHomeLayout(query?: LayoutQuery): Promise<ApiResult<LayoutResponse>> {
    return this.client.get<LayoutResponse>("/v1/layouts/main", { query });
  }

  getHomeLayoutSections(query?: LayoutQuery): Promise<ApiResult<LayoutSection>> {
    return this.client.get<LayoutSectionResponse>("/v1/layout-sections/home", { query });
  }

  getHomeLayoutSection(sectionId: string, query?: LayoutQuery): Promise<ApiResult<LayoutSection>> {
    return this.client.get<LayoutSectionResponse>("/v1/layout-sections/:sectionId", { path: { sectionId }, query });
  }

  getBanners(query?: LayoutQuery): Promise<ApiResult<BannerListResponse>> {
    return this.client.get<BannerListResponse>("/v1/banners", { query });
  }

  getPopups(query?: LayoutQuery): Promise<ApiResult<PopupListResponse>> {
    return this.client.get<PopupListResponse>("/v1/popups", { query });
  }

  getPopup(query?: LayoutQuery): Promise<ApiResult<PopupListResponse>> {
    return this.client.get<PopupListResponse>("/v1/popup", { query });
  }
}

export function createHomeApi(client: BaseClient): HomeApi {
  return new HomeApi(client);
}
