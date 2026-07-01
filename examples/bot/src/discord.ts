import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Colors,
  ComponentType,
  EmbedBuilder,
  PermissionFlagsBits,
  chatInputApplicationCommandMention,
  inlineCode,
  unorderedList,
  type APIEmbed,
  type BaseGuildTextChannel,
  type Message,
  type TextBasedChannel,
} from "discord.js";
import type { Plot } from "zeta.js";
import { plotDisplayName, plotPersona, plotSearchDescription, replaceProfileNamePlaceholder, truncate } from "./content.ts";
import type { ChannelBinding, PlotPersona } from "./types.ts";

export const PLOT_BUTTON_PREFIX = "zeta:plot:";
export type PlotButtonAction = "prev" | "next" | "confirm" | "cancel";

export function buildPlotSearchResponse(selectionId: string, keyword: string, plots: Plot[], index = 0, displayName?: string) {
  if (plots.length === 0) {
    return {
      embeds: [
        new EmbedBuilder()
          .setTitle(`プロット検索結果: ${keyword}`)
          .setDescription("プロットが見つかりませんでした.")
          .setColor(Colors.Yellow),
      ],
      components: [],
    };
  }

  const boundedIndex = Math.min(Math.max(index, 0), plots.length - 1);
  const plot = plots[boundedIndex]!;
  const mediaGallery = plotMediaGallery(plot);
  return {
    embeds: [plotSearchEmbed(plot, boundedIndex, plots.length, displayName), ...mediaGallery],
    components: buildPlotSearchButtons(selectionId, boundedIndex, plots.length),
  };
}

export function plotSearchCanceledEmbed(): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("プロット選択をキャンセルしました")
    .setColor(Colors.DarkerGrey);
}

export function parsePlotButtonCustomId(customId: string): { action: PlotButtonAction; selectionId: string } | undefined {
  if (!customId.startsWith(PLOT_BUTTON_PREFIX)) {
    return undefined;
  }

  const rest = customId.slice(PLOT_BUTTON_PREFIX.length);
  const index = rest.indexOf(":");
  if (index < 0) {
    return undefined;
  }

  const action = rest.slice(0, index);
  if (action !== "prev" && action !== "next" && action !== "confirm" && action !== "cancel") {
    return undefined;
  }

  return { action, selectionId: rest.slice(index + 1) };
}

function plotSearchEmbed(plot: Plot, index: number, total: number, displayName: string | undefined): EmbedBuilder {
  const persona = plotPersona(plot);
  const description = plotSearchDescription(plot);
  const embed = new EmbedBuilder()
    .setTitle(persona.name)
    .setDescription(truncate(displayName ? replaceProfileNamePlaceholder(description, displayName) : description, 4096))
    .setColor(Colors.Blurple)
    .setURL(`https://zeta-ai.io/#${plot.id ?? plot.plotId}`)
    .setFooter({
      text: footerText(plot),
      iconURL: creatorIconUrl(plot),
    });

  addPlotDetailFields(embed, plot, displayName);

  if (persona.avatarUrl) {
    embed.setThumbnail(persona.avatarUrl);
  }

  const updatedAt = toDate(plot.updatedAt ?? plot.releasedAt);
  if (updatedAt) {
    embed.setTimestamp(updatedAt);
  }

  return embed;
}

function buildPlotSearchButtons(selectionId: string, index: number, total: number) {
  const paginationRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${PLOT_BUTTON_PREFIX}prev:${selectionId}`)
      .setLabel("←")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index <= 0),
    new ButtonBuilder()
      .setCustomId(`${PLOT_BUTTON_PREFIX}page:${selectionId}`)
      .setLabel(`${index + 1}/${total}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`${PLOT_BUTTON_PREFIX}next:${selectionId}`)
      .setLabel("→")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index >= total - 1),
  );
  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${PLOT_BUTTON_PREFIX}cancel:${selectionId}`)
      .setLabel("キャンセル")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`${PLOT_BUTTON_PREFIX}confirm:${selectionId}`)
      .setLabel("確定")
      .setStyle(ButtonStyle.Success),
  )

  return [paginationRow, actionRow];
}

function footerText(plot: Plot): string {
  const creator = plot.creator;
  return creator?.name ?? creator?.username ?? "作者不明";
}

function creatorIconUrl(plot: Plot): string | undefined {
  return plot.creator?.profileImageUrl ?? undefined;
}

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value !== "string" && typeof value !== "number") {
    return undefined;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : undefined;
}

export function plotSelectedEmbed(plot: Plot, talkId: string, displayName?: string): EmbedBuilder {
  const persona = plotPersona(plot);
  const plotName = plotDisplayName(plot);
  const description = plotSearchDescription(plot);
  const embed = new EmbedBuilder()
    .setTitle("プロットを紐づけました")
    .setAuthor({
      name: plotName,
    })
    .setDescription(truncate(displayName ? replaceProfileNamePlaceholder(description, displayName) : description, 4096))
    // .addFields(
    //   { name: "プロットId", value: plot.id ?? plot.plotId ?? "不明", inline: true },
    //   { name: "トークId", value: talkId, inline: true },
    // )
    .setColor(Colors.Green);

  addPlotDetailFields(embed, plot, displayName);

  if (persona.avatarUrl) {
    embed.setThumbnail(persona.avatarUrl);
  }

  return embed;
}

export function zetaPlotCommandMention(commandId: string | undefined): string {
  return commandId ? chatInputApplicationCommandMention("zeta", "plot", commandId) : "`/zeta plot keyword:<keyword>`";
}

export function zetaUnlinkCommandMention(commandId: string | undefined): string {
  return commandId ? chatInputApplicationCommandMention("zeta", "unlink", commandId) : "`/zeta unlink`";
}

export function setupRequiredEmbed(commandMention: string): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle("プロットがまだ紐付けられていません")
    .setDescription(`${commandMention} を最初に実行してください.`)
    .setColor(Colors.Yellow);
}

export function unlinkEmbed(binding: ChannelBinding | undefined): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(binding ? "プロットを解除しました" : "プロットが紐付けられていません")
    .setDescription(binding ? `${inlineCode(binding.plotName)}の紐づけを解除しました.` : "このチャンネルはトークに紐付けられていません.")
    .setColor(binding ? Colors.Green : Colors.Yellow);
}

export async function sendPersonaMessage(
  channel: TextBasedChannel,
  binding: ChannelBinding,
  text: string,
  saveWebhookId: (webhookId: string) => Promise<void>,
  replyTo?: Message,
  personaOverride?: PlotPersona,
  forceEmbed = false,
): Promise<void> {
  const persona = personaOverride ?? { name: binding.plotName, avatarUrl: binding.avatarUrl };

  if (channel.isTextBased()) {
    const sent = await trySendWebhook(channel as BaseGuildTextChannel, binding.webhookId, persona, text, saveWebhookId, forceEmbed);
    if (sent) {
      return;
    }
  }

  if (replyTo) {
    await replyWithPersonaFallback(replyTo, binding, text, persona);
    return;
  }

  if (channel.isSendable()) {
    for (const chunk of chunkText(text, 3900)) {
      await channel.send({ embeds: [personaFallbackEmbed(persona, chunk)] });
    }
  }
}

export async function replyWithPersonaFallback(message: Message, binding: ChannelBinding, text: string, personaOverride?: PlotPersona): Promise<void> {
  const persona = personaOverride ?? { name: binding.plotName, avatarUrl: binding.avatarUrl };
  const [first, ...rest] = chunkText(text, 3900);
  await message.reply({ embeds: [personaFallbackEmbed(persona, first ?? "")] });
  if (message.channel.isSendable()) {
    for (const chunk of rest) {
      await message.channel.send({ embeds: [personaFallbackEmbed(persona, chunk)] });
    }
  }
}

function personaFallbackEmbed(persona: PlotPersona, text: string): APIEmbed {
  const embed = new EmbedBuilder()
    .setDescription(text)
    .setAuthor({
      name: persona.name,
      iconURL: persona.avatarUrl,
    })
    .setColor(Colors.Blurple);

  return embed.toJSON();
}

async function trySendWebhook(
  channel: BaseGuildTextChannel,
  webhookId: string | undefined,
  persona: PlotPersona,
  text: string,
  saveWebhookId: (webhookId: string) => Promise<void>,
  forceEmbed: boolean,
): Promise<boolean> {
  const me = channel.guild.members.me;
  const permissions = me ? channel.permissionsFor(me) : undefined;
  if (!permissions?.has(PermissionFlagsBits.ManageWebhooks)) {
    return false;
  }

  try {
    const webhook = await getOrCreateWebhook(channel, webhookId);
    await saveWebhookId(webhook.id);
    for (const chunk of chunkText(text, 1900)) {
      if (forceEmbed) {
        await webhook.send({
          embeds: [personaFallbackEmbed(persona, chunk)],
          username: persona.name,
          avatarURL: persona.avatarUrl,
          allowedMentions: { parse: [] },
        });
      } else {
        await webhook.send({
          content: chunk,
          username: persona.name,
          avatarURL: persona.avatarUrl,
          allowedMentions: { parse: [] },
        });
      }
    }
    return true;
  } catch {
    return false;
  }
}

async function getOrCreateWebhook(channel: BaseGuildTextChannel, webhookId: string | undefined) {
  if (webhookId) {
    const webhooks = await channel.fetchWebhooks();
    const existing = webhooks.get(webhookId);
    if (existing) {
      return existing;
    }
  }

  return await channel.createWebhook({ name: "Zeta Bridge" });
}

function chunkText(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let rest = text;
  while (rest.length > maxLength) {
    const newline = rest.lastIndexOf("\n", maxLength);
    const space = rest.lastIndexOf(" ", maxLength);
    const index = Math.max(newline, space, Math.floor(maxLength * 0.75));
    chunks.push(rest.slice(0, index).trim());
    rest = rest.slice(index).trim();
  }
  if (rest) {
    chunks.push(rest);
  }
  return chunks;
}

function addPlotDetailFields(embed: EmbedBuilder, plot: Plot, displayName?: string): void {
  const relatedPlots = Array.isArray(plot.characters) ? plot.characters.map((item) => item.name).filter(Boolean) : [];
  if (relatedPlots.length > 0) {
    embed.addFields({
      name: "登場キャラクター",
      value: unorderedList(relatedPlots.slice(0, 10).map(String)),
      inline: false,
    });
  }

  const creatorComment = readStringField(plot, "creatorComment") ?? readStringField(plot, "comment");
  if (creatorComment) {
    const value = displayName ? replaceProfileNamePlaceholder(creatorComment, displayName) : creatorComment;
    embed.addFields({
      name: "コメント",
      value: value.slice(0, 1024),
      inline: false,
    });
  }
}

function plotMediaGallery(plot: Plot) {
  const urls = uniqueStrings([
    plot.initialRoomImageUrl,
    ...(plot.characters ?? []).map((character) => character.imageUrl),
  ]).slice(0, 9);

  if (urls.length === 0) {
    return [];
  }

  return urls.map((url) => new EmbedBuilder()
    .setURL(`https://zeta-ai.io/#${plot.id ?? plot.plotId}`)
    .setImage(url));
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value?.trim())))];
}

function readStringField(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
