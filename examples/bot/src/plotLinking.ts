import {
  inlineCode,
  MessageFlags,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
} from "discord.js";
import type { Plot, ZetaClient } from "@evex/zeta";
import { plotDisplayName, plotPersona, speakerProfilesFromApi } from "./content.ts";
import {
  buildPlotSearchResponse,
  parsePlotButtonCustomId,
  plotSearchCanceledEmbed,
  plotSelectedEmbed,
  unlinkEmbed,
  zetaPlotCommandMention,
  zetaUnlinkCommandMention,
} from "./discord.ts";
import type { BindingStore } from "./state.ts";
import type { PendingPlotSelection } from "./types.ts";
import type { TalkMessageService } from "./talkMessages.ts";

export class PlotLinkingService {
  private readonly pendingSelections = new Map<string, PendingPlotSelection>();

  constructor(
    private readonly zeta: ZetaClient,
    private readonly store: BindingStore,
    private readonly talkMessages: TalkMessageService,
    private readonly getZetaCommandId: () => string | undefined,
  ) {}

  async handleCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    if (interaction.commandName !== "zeta") {
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    if (subcommand === "plot") {
      await this.handlePlotCommand(interaction);
      return;
    }

    if (subcommand === "unlink") {
      const binding = await this.store.unlink(interaction.channelId);
      await this.talkMessages.deleteBindingWebhook(binding);
      await interaction.reply({ embeds: [unlinkEmbed(binding)] });
    }
  }

  async handlePlotButton(interaction: ButtonInteraction): Promise<void> {
    const parsed = parsePlotButtonCustomId(interaction.customId);
    if (!parsed) {
      return;
    }

    const pending = this.pendingSelections.get(parsed.selectionId);
    if (!pending || pending.userId !== interaction.user.id || pending.channelId !== interaction.channelId) {
      await interaction.reply({ content: `このプロット選択は期限切れです. もう一度 ${zetaPlotCommandMention(this.getZetaCommandId())} を実行してください.`, flags: MessageFlags.Ephemeral });
      return;
    }

    await interaction.deferUpdate();

    if (parsed.action === "cancel") {
      this.pendingSelections.delete(parsed.selectionId);
      await interaction.editReply({ embeds: [plotSearchCanceledEmbed()], components: [] });
      return;
    }

    if (parsed.action === "prev" || parsed.action === "next") {
      pending.currentIndex += parsed.action === "prev" ? -1 : 1;
      pending.currentIndex = Math.min(Math.max(pending.currentIndex, 0), pending.plots.length - 1);
      await interaction.editReply(buildPlotSearchResponse(parsed.selectionId, "results", pending.plots, pending.currentIndex, pending.displayName));
      return;
    }

    const selectedPlot = pending.plots[pending.currentIndex];
    if (!selectedPlot) {
      await interaction.followUp({ content: `選択したプロットが見つかりませんでした. もう一度 ${zetaPlotCommandMention(this.getZetaCommandId())} を実行してください.`, flags: MessageFlags.Ephemeral });
      return;
    }

    const plotId = selectedPlot.id ?? selectedPlot.plotId;
    if (!plotId) {
      await interaction.followUp({ content: "選択したプロットにはidがありませんでした.", flags: MessageFlags.Ephemeral });
      return;
    }

    const plot = await this.hydratePlot(selectedPlot);
    const talk = await this.zeta.talk.create({ plotId });
    const speakerProfiles = speakerProfilesFromApi(await talk.getSpeakerProfiles().catch(() => []));
    const persona = plotPersona(plot);
    const plotName = plotDisplayName(plot);
    const binding = await this.store.set({
      channelId: interaction.channelId,
      talkId: talk.id,
      plotId,
      plotName,
      avatarUrl: persona.avatarUrl,
      speakerProfiles,
    });

    this.pendingSelections.delete(parsed.selectionId);
    await interaction.editReply({ content: "プロットを紐づけました.", embeds: [], components: [] });
    const displayName = interactionDisplayName(interaction);
    await interaction.followUp({ embeds: [plotSelectedEmbed(plot, talk.id, displayName)] });
    await this.talkMessages.postIntroMessages(binding, displayName);
  }

  private async handlePlotCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    const existing = this.store.get(interaction.channelId);
    if (existing) {
      await interaction.reply({
        content: `このチャンネルはすでに${inlineCode(existing.plotName)}に紐付けられています. ${zetaUnlinkCommandMention(this.getZetaCommandId())} を実行すると解除できます.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const keyword = interaction.options.getString("keyword", true);
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const result = await this.zeta.search.searchPlots({ keyword, limit: 10 });
    const searchPlots = result.data.plots.filter((plot): plot is Plot => Boolean(plot?.id ?? plot?.plotId));
    const plots = await this.hydratePlots(searchPlots);
    const selectionId = interaction.id;
    this.pendingSelections.set(selectionId, {
      userId: interaction.user.id,
      channelId: interaction.channelId,
      displayName: commandDisplayName(interaction),
      plots,
      currentIndex: 0,
      createdAt: Date.now(),
    });
    this.prunePendingSelections();

    await interaction.editReply(buildPlotSearchResponse(selectionId, keyword, plots, 0, commandDisplayName(interaction)));
  }

  private async hydratePlots(plots: Plot[]): Promise<Plot[]> {
    return await Promise.all(plots.map((plot) => this.hydratePlot(plot)));
  }

  private async hydratePlot(plot: Plot): Promise<Plot> {
    const plotId = plot.id ?? plot.plotId;
    if (!plotId) {
      return plot;
    }

    return await this.zeta.plots.get(plotId).then((resource) => resource.data ?? plot).catch(() => plot);
  }

  private prunePendingSelections(): void {
    const expiresBefore = Date.now() - 15 * 60_000;
    for (const [key, value] of this.pendingSelections) {
      if (value.createdAt < expiresBefore) {
        this.pendingSelections.delete(key);
      }
    }
  }
}

function interactionDisplayName(interaction: ButtonInteraction): string {
  const member = interaction.member;
  if (member && typeof member === "object" && "displayName" in member && typeof member.displayName === "string") {
    return member.displayName;
  }

  return interaction.user.displayName;
}

function commandDisplayName(interaction: ChatInputCommandInteraction): string {
  const member = interaction.member;
  if (member && typeof member === "object" && "displayName" in member && typeof member.displayName === "string") {
    return member.displayName;
  }

  return interaction.user.displayName ?? interaction.user.globalName ?? interaction.user.username;
}
