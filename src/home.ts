import type { BaseClient } from "./core/client.ts";
import type {
  BannerListResponse,
  InfinitePlotsResponse,
  LayoutQuery,
  LayoutResponse,
  LayoutSectionResponse,
  PlotListQuery,
  PopupListResponse,
} from "./domainTypes.ts";
export class HomeApi {
  constructor(private readonly client: BaseClient) {}

  getInfinitePlots(query?: PlotListQuery) {
    return this.client.get<InfinitePlotsResponse>("/v1/infinite-plots", { query });
  }

  getHomeLayout(query?: LayoutQuery) {
    return this.client.get<LayoutResponse>("/v1/layouts/main", { query });
  }

  getHomeLayoutSections(query?: LayoutQuery) {
    return this.client.get<LayoutSectionResponse>("/v1/layout-sections/home", { query });
  }

  getHomeLayoutSection(sectionId: string, query?: LayoutQuery) {
    return this.client.get<LayoutSectionResponse>("/v1/layout-sections/:sectionId", { path: { sectionId }, query });
  }

  getBanners(query?: LayoutQuery) {
    return this.client.get<BannerListResponse>("/v1/banners", { query });
  }

  getPopups(query?: LayoutQuery) {
    return this.client.get<PopupListResponse>("/v1/popups", { query });
  }

  getPopup(query?: LayoutQuery) {
    return this.client.get<PopupListResponse>("/v1/popup", { query });
  }
}

export function createHomeApi(client: BaseClient): HomeApi {
  return new HomeApi(client);
}
