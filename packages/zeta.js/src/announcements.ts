import type { BaseClient } from "./core/client.ts";
import type {
  Announcement,
  AnnouncementBannerResponse,
  AnnouncementQuery,
  AnnouncementListResponse,
  SupportAnnouncementListResponse,
} from "./domainTypes.ts";
export class AnnouncementsApi {
  constructor(private readonly client: BaseClient) {}

  listAnnouncements(query?: AnnouncementQuery) {
    return this.client.get<AnnouncementListResponse>("/v1/announcements/", { query });
  }

  getAnnouncement(announcementId: string) {
    return this.client.get<Announcement>("/v1/announcements/:announcementId", { path: { announcementId } });
  }

  getAnnouncementBanner() {
    return this.client.get<AnnouncementBannerResponse>("/v1/announcements/banner");
  }

  listSupportAnnouncements(query?: AnnouncementQuery) {
    return this.client.get<SupportAnnouncementListResponse>("/v1/support-announcements", { query });
  }
}

export function createAnnouncementsApi(client: BaseClient): AnnouncementsApi {
  return new AnnouncementsApi(client);
}
