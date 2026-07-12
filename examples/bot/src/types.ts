import type { Plot } from "@evex/zeta";

export type ChannelBinding = {
  channelId: string;
  talkId: string;
  plotId: string;
  plotName: string;
  avatarUrl?: string;
  speakerProfiles?: PlotPersona[];
  webhookId?: string;
  createdAt: string;
  updatedAt: string;
};

export type BindingStoreData = {
  bindings: Record<string, ChannelBinding>;
};

export type PendingPlotSelection = {
  userId: string;
  channelId: string;
  displayName: string;
  plots: Plot[];
  currentIndex: number;
  createdAt: number;
};

export type PlotPersona = {
  name: string;
  avatarUrl?: string;
};
