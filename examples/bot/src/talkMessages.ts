import {
  type Client,
  type Message,
} from "discord.js";
import type { ChatStreamEvent, Message as ZetaMessage, ZetaClient } from "zeta.js";
import {
  messageToSegments,
  replaceDiscordUserMentions,
  replaceProfileNamePlaceholder,
  resolveSpeakerPersona,
  segmentsToText,
  speakerProfilesFromApi,
  streamEventToSegments,
  stripBotMentions,
  type TextSegment,
} from "./content.ts";
import { sendPersonaMessage, setupRequiredEmbed, zetaPlotCommandMention } from "./discord.ts";
import type { BindingStore } from "./state.ts";
import type { ChannelBinding } from "./types.ts";

export class TalkMessageService {
  constructor(
    private readonly client: Client,
    private readonly zeta: ZetaClient,
    private readonly store: BindingStore,
    private readonly getZetaCommandId: () => string | undefined,
  ) {}

  async handleMessageTrigger(message: Message): Promise<void> {
    if (!this.client.user) {
      return;
    }

    const mentionsBot = message.mentions.users.has(this.client.user.id);
    const binding = this.store.get(message.channelId);
    const repliesToWebhook = binding ? await this.isReplyToBindingWebhook(message, binding) : false;

    if (!mentionsBot && !repliesToWebhook) {
      return;
    }

    if (!binding) {
      await message.reply({ embeds: [setupRequiredEmbed(zetaPlotCommandMention(this.getZetaCommandId()))] });
      return;
    }
    await this.ensureSpeakerProfiles(binding);

    const text = replaceDiscordUserMentions(stripBotMentions(message.content, this.client.user.id), (userId) => mentionDisplayName(message, userId)).trim();
    if (!text) {
      await message.reply("メンションに続けてメッセージを入力してください");
      return;
    }

    const stopTyping = startTyping(message.channel);
    try {
      const stream = await this.zeta.talk.fromId(binding.talkId).sendTextMessage(text);
      let latestSegments: TextSegment[] = [];
      let completedSegments: TextSegment[] = [];

      for await (const event of stream) {
        const parsed = streamEventToSegments(event.data as ChatStreamEvent);
        if (parsed.segments.length > 0) {
          latestSegments = parsed.segments;
        }
        if (parsed.complete && parsed.segments.length > 0) {
          completedSegments = parsed.segments;
        }
      }

      const replySegments = completedSegments.length > 0 ? completedSegments : latestSegments;
      if (replySegments.length === 0) {
        await message.reply("Zetaが空の応答を返しました.");
        return;
      }

      await this.sendTextSegments(message.channel, binding, replySegments, message.member?.displayName ?? message.author.displayName, message);
    } finally {
      stopTyping();
    }
  }

  async postIntroMessages(binding: ChannelBinding, displayName?: string): Promise<void> {
    const channel = await this.client.channels.fetch(binding.channelId);
    if (!channel?.isTextBased()) {
      return;
    }

    const talk = this.zeta.talk.fromId(binding.talkId);
    await this.ensureSpeakerProfiles(binding);
    const intros = await this.collectIntroMessages(talk);
    for (const intro of intros) {
      const segments = messageToSegments(intro);
      if (segments.length === 0) {
        continue;
      }

      await this.sendTextSegments(channel, binding, segments, displayName);
    }
  }

  async deleteBindingWebhook(binding: ChannelBinding | undefined): Promise<void> {
    if (!binding?.webhookId) {
      return;
    }

    const channel = await this.client.channels.fetch(binding.channelId).catch(() => undefined);
    if (!channel || !("fetchWebhooks" in channel)) {
      return;
    }

    const webhooks = await channel.fetchWebhooks().catch(() => undefined);
    const webhook = webhooks?.get(binding.webhookId);
    await webhook?.delete("Zeta channel unlinked").catch(() => undefined);
  }

  private async isReplyToBindingWebhook(message: Message, binding: ChannelBinding): Promise<boolean> {
    if (!binding.webhookId || !message.reference?.messageId) {
      return false;
    }

    const referenced = await message.fetchReference().catch(() => undefined);
    return referenced?.webhookId === binding.webhookId;
  }

  private async ensureSpeakerProfiles(binding: ChannelBinding): Promise<void> {
    if (binding.speakerProfiles && binding.speakerProfiles.length > 0) {
      return;
    }

    const profiles = speakerProfilesFromApi(await this.zeta.talk.fromId(binding.talkId).getSpeakerProfiles().catch(() => []));
    if (profiles.length === 0) {
      return;
    }

    binding.speakerProfiles = profiles;
    await this.store.update(binding.channelId, { speakerProfiles: profiles });
  }

  private async sendTextSegments(
    channel: Message["channel"],
    binding: ChannelBinding,
    segments: TextSegment[],
    displayName: string | undefined,
    replyTo?: Message,
  ): Promise<void> {
    let isFirst = true;
    for (const group of groupAdjacentSegments(segments)) {
      const text = segmentsToText(group.segments);
      if (!text) {
        continue;
      }

      const resolvedText = displayName ? replaceProfileNamePlaceholder(text, displayName) : text;
      const isSystemMessage = !group.speakerName?.trim();
      const plotPersona = { name: binding.plotName, avatarUrl: binding.avatarUrl };
      const persona = isSystemMessage ? plotPersona : resolveSpeakerPersona(group.speakerName, binding.speakerProfiles, plotPersona);
      await sendPersonaMessage(channel, binding, resolvedText, async (webhookId) => {
        if (binding.webhookId !== webhookId) {
          await this.store.update(binding.channelId, { webhookId });
          binding.webhookId = webhookId;
        }
      }, isFirst ? replyTo : undefined, persona, isSystemMessage);
      isFirst = false;
    }
  }

  private async collectIntroMessages(talk: ReturnType<ZetaClient["talk"]["fromId"]>): Promise<ZetaMessage[]> {
    const fromCreate = await talk.createIntro().then((result) => readIntroMessages(result.data)).catch(() => []);
    if (fromCreate.length > 0) {
      return fromCreate;
    }

    const beforeSelection = await talk.getIntroBeforeSelection().then((result) => readIntroMessages(result.data)).catch(() => []);
    if (beforeSelection.length > 0) {
      return beforeSelection;
    }

    const messages = await talk.listMessages({ limit: 10 }).then((result) => result.data.messages).catch(() => []);
    return messages.filter((message) => message.isIntro);
  }
}

function groupAdjacentSegments(segments: TextSegment[]): Array<{ speakerName?: string; segments: TextSegment[] }> {
  const groups: Array<{ speakerName?: string; segments: TextSegment[] }> = [];
  for (const segment of segments) {
    const current = groups.at(-1);
    if (current && current.speakerName === segment.speakerName) {
      current.segments.push(segment);
    } else {
      groups.push({ speakerName: segment.speakerName, segments: [segment] });
    }
  }
  return groups;
}

function mentionDisplayName(message: Message, userId: string): string | undefined {
  const member = message.mentions.members?.get(userId);
  if (member) {
    return member.displayName;
  }

  const user = message.mentions.users.get(userId);
  return user?.displayName ?? user?.globalName ?? user?.username;
}

function readIntroMessages(data: unknown): ZetaMessage[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  const value = data as { intro?: ZetaMessage | null; intros?: ZetaMessage[]; message?: ZetaMessage | null };
  if (Array.isArray(value.intros) && value.intros.length > 0) {
    return value.intros;
  }
  return [value.intro, value.message].filter((message): message is ZetaMessage => Boolean(message));
}

function startTyping(channel: Message["channel"]): () => void {
  let active = true;
  const send = () => {
    if (active && channel.isSendable()) {
      channel.sendTyping().catch(() => undefined);
    }
  };

  send();
  const timer = setInterval(send, 8_000);
  return () => {
    active = false;
    clearInterval(timer);
  };
}
