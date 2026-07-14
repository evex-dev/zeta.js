import {
  fetchLatestIosClientVersion,
  ZetaClient,
  type Message as ZetaMessage,
  type Plot,
  type TokenPair,
} from "@evex/zeta";
import {
  LineService,
  conversationIdFromSource,
  conversationLabelFromSource,
} from "./line.ts";
import {
  MAX_FLEX_CAROUSEL_BUBBLES,
  MAX_LINE_MESSAGES,
  buildSystemMessage,
  buildPlotCarouselMessage,
  buildPlotInfoMessage,
  buildUnlinkMessage,
  continuationQuickReply,
  firstText,
  mergeSpeakerProfiles,
  messageToSegments,
  plotDisplayName,
  plotPersona,
  readIntroMessages,
  recommendedQuickReply,
  retryQuickReply,
  segmentsToTextLineMessages,
  speakerProfilesFromApi,
  speakerProfilesFromPlot,
  streamEventToSegments,
  unlinkQuickReply,
  truncate,
} from "./messages.ts";
import type {
  ConversationBinding,
  LineEvent,
  LineSource,
  LineTextMessage,
  LineWebhookPayload,
  ProcessPayload,
  TextSegment,
  ZetaCredentialInput,
  ZetaTokens,
} from "./types.ts";

const TOKENS_KEY = "zetaTokens";
const BINDINGS_KEY = "bindings";
const GROUP_LAST_BOT_MESSAGE_IDS_KEY = "groupLastBotMessageIds";
const CONTINUATIONS_KEY = "continuations";
const IOS_CLIENT_VERSION_KEY = "iosClientVersion";

type ContinuationRecord = {
  conversationId: string;
  messages: Parameters<LineService["replyMessage"]>[1];
  deliveredCount: number;
  totalCount: number;
  createdAt: string;
};

export class ZetaState {
  private queue: Promise<void> = Promise.resolve();
  private zeta?: ZetaClient;

  constructor(
    private readonly state: DurableObjectState,
    private readonly env: CloudflareBindings,
  ) {}

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/process" && request.method === "POST") {
      const { payload } = (await request.json()) as ProcessPayload;
      this.queue = this.queue.then(() => this.processWebhook(payload));
      await this.queue;
      return Response.json({ ok: true });
    }

    if (url.pathname === "/zeta-cred" && request.method === "POST") {
      const credential = (await request.json()) as ZetaCredentialInput;
      await this.setInitialZetaCredential(credential);
      return Response.json({ ok: true });
    }

    return new Response("Not found", { status: 404 });
  }

  private async processWebhook(payload: LineWebhookPayload): Promise<void> {
    const events = payload.events ?? [];
    for (const event of events) {
      await this.processEvent(event, payload.destination).catch(
        async (error) => {
          console.error("LINE event failed", describeError(error));
          if ("replyToken" in event && event.replyToken) {
            const retryText =
              event.source?.type === "user" &&
              event.type === "message" &&
              event.message.type === "text"
                ? normalizeRetryText(event.message.text)
                : undefined;
            await this.replyAndRemember(event.replyToken, event.source, [
              {
                ...buildSystemMessage(
                  "処理中にエラーが発生しました",
                  "もう一度お試しください。",
                ),
                ...(retryText
                  ? { quickReply: retryQuickReply(retryText) }
                  : {}),
              },
            ]).catch(() => undefined);
          }
        },
      );
    }
  }

  private async getRecommendations(): Promise<string[]> {
    const zeta = await this.createZetaClient();

    return [
      ...new Set(
        [
          ...(await Promise.all([
            zeta.search
              .getRecommendedPlaceholder()
              .then((result) => result.data.recommendedQueryList ?? [])
              .catch(() => []),
            zeta.search
              .getRecommendedKeywords()
              .then((result) => result.data.keywords ?? [])
              .catch(() => []),
          ])),
        ].flat(),
      ),
    ];
  }

  private async processEvent(
    event: LineEvent,
    botUserId: string | undefined,
  ): Promise<void> {
    if (event.type === "follow" || event.type === "join") {
      if (event.replyToken) {
        await this.replyAndRemember(event.replyToken, event.source, [
          {
            ...buildSystemMessage(
              "友だち追加ありがとうございます!",
              "まずは使いたいプロット名やキーワードを送ってください。検索結果から選択するとチャットを始められます。",
            ),
            quickReply: recommendedQuickReply(await this.getRecommendations()),
          },
        ]);
      }
      return;
    }

    if (event.type === "unfollow") {
      const { source } = event;
      const conversationId = conversationIdFromSource(source);
      if (!source || !conversationId) return;
      await this.unlink(conversationId);
      return;
    }

    if (event.type === "postback") {
      await this.handlePostback(event);
      return;
    }

    if (event.type !== "message" || event.message.type !== "text") {
      return;
    }

    await this.handleTextMessage(
      event.replyToken,
      event.source,
      event.message,
      botUserId,
    );
  }

  private async handleTextMessage(
    replyToken: string | undefined,
    source: LineSource | undefined,
    message: LineTextMessage,
    botUserId: string | undefined,
  ): Promise<void> {
    const conversationId = conversationIdFromSource(source);
    if (!source || !conversationId || !replyToken) {
      return;
    }

    const fromUserId = "userId" in source ? source.userId : undefined;
    const isUserChat = source.type === "user";
    const isGroupLike = source.type === "group" || source.type === "room";
    const mentionsBot = isGroupLike && messageMentionsBot(message, botUserId);
    const bindings = await this.getBindings();
    const binding = bindings[conversationId];
    const quotesBot =
      isGroupLike &&
      (await this.isQuotedLastBotMessage(conversationId, message));
    if (isGroupLike && !mentionsBot && !quotesBot) {
      return;
    }

    const text = stripBotMentions(message, botUserId).trim();
    if (!text) {
      await this.replyAndRemember(replyToken, source, [
        buildSystemMessage(
          "メッセージを入力してください",
          "メンションに続けて内容を送ってください。",
        ),
      ]);
      return;
    }

    if (isUserChat && fromUserId) {
      await this.line
        .showLoadingAnimation(fromUserId, 20)
        .catch(() => undefined);
    }

    if (!binding) {
      const displayName = await this.displayNameForSource(source);
      await this.searchPlots(
        replyToken,
        source,
        conversationId,
        text,
        displayName,
      );
      return;
    }

    const displayName = await this.displayNameForSource(source);
    await this.replyFromTalk(
      replyToken,
      conversationId,
      binding,
      source,
      text,
      displayName,
      message.markAsReadToken,
    );
  }

  private async unlink(conversationId: string) {
    const bindings = await this.getBindings();
    if (!bindings[conversationId]) return;

    const binding = bindings[conversationId];
    if (binding?.userChatProfileId) {
      const zeta = await this.createZetaClient();
      await zeta.profile.chatProfiles
        .fromId(binding.userChatProfileId)
        .delete()
        .catch((error) => {
          console.error(
            "failed to delete zeta chat profile",
            describeError(error),
          );
        });
    }
    delete bindings[conversationId];
    await this.putBindings(bindings);
  }

  private async handlePostback(
    event: Extract<LineEvent, { type: "postback" }>,
  ): Promise<void> {
    const source = event.source;
    const conversationId = conversationIdFromSource(source);
    if (!conversationId || !event.replyToken) {
      return;
    }

    const data = new URLSearchParams(event.postback.data ?? "");
    const action = data.get("action");
    if (action === "continue") {
      await this.replyContinuation(
        event.replyToken,
        source,
        conversationId,
        data.get("continuationId"),
      );
      return;
    }

    if (action === "unlink") {
      await this.unlink(conversationId);
      await this.replyAndRemember(event.replyToken, source, [
        {
          ...buildSystemMessage(
            "紐づけを解除しました",
            "次のメッセージでまた検索できます。",
          ),
          quickReply: recommendedQuickReply(await this.getRecommendations()),
        },
      ]);
      return;
    }

    if (action !== "bind") {
      return;
    }

    const plotId = data.get("plotId");
    if (!plotId) {
      await this.replyAndRemember(event.replyToken, source, [
        {
          ...buildSystemMessage(
            "プロットを選択できませんでした",
            "もう一度検索してください。",
          ),
          quickReply: recommendedQuickReply(await this.getRecommendations()),
        },
      ]);
      return;
    }

    const bindings = await this.getBindings();
    if (bindings[conversationId]) {
      return await this.replyAndRemember(event.replyToken, source, [
        {
          type: "flex",
          contents: buildUnlinkMessage(),
          altText: "紐づけを解除してください",
        },
      ]);
    }

    await this.bindPlot(event.replyToken, conversationId, source, plotId);
  }

  private async searchPlots(
    replyToken: string,
    source: LineSource,
    conversationId: string,
    keyword: string,
    displayName: string,
  ): Promise<void> {
    const zeta = await this.createZetaClient();
    const result = await zeta.search.searchPlots({
      keyword,
      limit: MAX_FLEX_CAROUSEL_BUBBLES,
    });
    const searchPlots = (result.data.plots ?? []).filter((plot): plot is Plot =>
      Boolean(plot?.id ?? plot?.plotId),
    );
    const plots = await Promise.all(
      searchPlots.map((plot) => this.hydratePlot(zeta, plot)),
    );

    if (plots.length === 0) {
      await this.replyAndRemember(replyToken, source, [
        {
          ...buildSystemMessage(
            "プロットが見つかりませんでした",
            `「${keyword}」に合うプロットが見つかりませんでした。別のキーワードで試してください。`,
          ),
          quickReply: recommendedQuickReply(await this.getRecommendations()),
        },
      ]);
      return;
    }

    const [related, recommended] = await Promise.all([
      zeta.search
        .getRelatedKeywords({ keyword, limit: 10 })
        .then((result) => result.data.relatedKeywords ?? [])
        .catch(() => []),
      zeta.search
        .getRecommendedKeywords({ keyword, limit: 10 })
        .then((result) => result.data.keywords ?? [])
        .catch(() => []),
    ]);

    const relatedKeywords = [...new Set([...related, ...recommended])];

    await this.replyAndRemember(replyToken, source, [
      buildPlotCarouselMessage(
        conversationId,
        keyword,
        plots,
        displayName,
        relatedKeywords,
      ),
    ]);
  }

  private async bindPlot(
    replyToken: string,
    conversationId: string,
    source: LineSource | undefined,
    plotId: string,
  ): Promise<void> {
    const zeta = await this.createZetaClient();
    const plot = await zeta.plots
      .get(plotId)
      .then((resource) => resource.data)
      .catch(() => undefined);

    const profileName = await this.chatProfileNameForSource(source);
    const chatProfile = await this.createChatProfile(
      zeta,
      profileName,
      conversationLabelFromSource(source),
    );
    const userChatProfileId = chatProfile.data?.id;
    if (!userChatProfileId) {
      throw new Error("Created Zeta chat profile did not include an id.");
    }

    let talk: Awaited<ReturnType<ZetaClient["talk"]["create"]>>;
    try {
      talk = await zeta.talk.create({
        plotId,
        chatProfile: {
          type: "userChatProfileId",
          id: userChatProfileId,
        },
      });
      await zeta.profile.chatProfiles
        .select(userChatProfileId, { plotId, roomId: talk.id })
        .catch((error) => {
          console.error(
            "failed to select zeta chat profile for new room",
            describeError(error),
          );
        });
    } catch (error) {
      await zeta.profile.chatProfiles
        .fromId(userChatProfileId)
        .delete()
        .catch((deleteError) => {
          console.error(
            "failed to delete zeta chat profile after room creation failure",
            describeError(deleteError),
          );
        });
      throw error;
    }

    const speakerProfiles = mergeSpeakerProfiles(
      speakerProfilesFromApi(await talk.getSpeakerProfiles().catch(() => [])),
      plot ? speakerProfilesFromPlot(plot) : [],
    );
    const persona = plot ? plotPersona(plot) : { name: "Zeta" };
    const plotName = plot ? plotDisplayName(plot) : "Zeta";
    const now = new Date().toISOString();

    const binding: ConversationBinding = {
      conversationId,
      talkId: talk.id,
      plotId,
      plotName,
      avatarUrl: persona.avatarUrl,
      speakerProfiles,
      userChatProfileId,
      userChatProfileName: profileName,
      createdAt: now,
      updatedAt: now,
    };

    const bindings = await this.getBindings();
    bindings[conversationId] = binding;
    await this.putBindings(bindings);

    const displayName = await this.displayNameForSource(source);
    const intros = await this.collectIntroMessages(zeta, talk.id);
    const introSegments = intros.flatMap((intro) => messageToSegments(intro));
    const messages = [
      buildSystemMessage(
        `「${plotName}」に紐づけました`,
        source?.type === "user"
          ? "このまま話しかけてください。"
          : "以降はBotへのメンション付きメッセージか、Botのメッセージへのリプライを送ってください。",
      ),
      ...(plot ? [buildPlotInfoMessage(plot, displayName)] : []),
      ...segmentsToTextLineMessages(binding, introSegments, displayName),
    ];
    await this.replyAndRemember(replyToken, source, messages, conversationId);
  }

  private async replyFromTalk(
    replyToken: string,
    conversationId: string,
    binding: ConversationBinding,
    source: LineSource,
    text: string,
    displayName: string,
    markAsReadToken: string | undefined,
  ): Promise<void> {
    const zeta = await this.createZetaClient();
    await this.updateChatProfileNameIfChanged(
      zeta,
      conversationId,
      binding,
      source,
    );
    await this.ensureSpeakerProfiles(zeta, conversationId, binding);

    await this.line.markAsRead(markAsReadToken).catch((error) => {
      console.error(
        "failed to mark LINE message as read",
        describeError(error),
      );
    });
    const stream = await zeta.talk.fromId(binding.talkId).sendTextMessage(text);
    let latestSegments: TextSegment[] = [];
    let completedSegments: TextSegment[] = [];

    for await (const event of stream) {
      const parsed = streamEventToSegments(event.data);
      if (parsed.segments.length > 0) {
        latestSegments = parsed.segments;
      }
      if (parsed.complete && parsed.segments.length > 0) {
        completedSegments = parsed.segments;
      }
    }

    const replySegments =
      completedSegments.length > 0 ? completedSegments : latestSegments;
    const messages = segmentsToTextLineMessages(
      binding,
      replySegments,
      displayName,
    );
    if (messages.length === 0) {
      await this.replyAndRemember(replyToken, source, [
        buildSystemMessage("Zetaが空の応答を返しました"),
      ]);
      return;
    }

    await this.replyAndRemember(replyToken, source, messages, conversationId);
  }

  private async ensureSpeakerProfiles(
    zeta: ZetaClient,
    conversationId: string,
    binding: ConversationBinding,
  ): Promise<void> {
    if (
      binding.speakerProfiles &&
      binding.speakerProfiles.length > 0 &&
      binding.speakerProfiles.some((profile) => profile.avatarUrl)
    ) {
      return;
    }

    const plot = await zeta.plots
      .get(binding.plotId)
      .then((resource) => resource.data)
      .catch(() => undefined);
    const speakerProfiles = mergeSpeakerProfiles(
      speakerProfilesFromApi(
        await zeta.talk
          .fromId(binding.talkId)
          .getSpeakerProfiles()
          .catch(() => []),
      ),
      plot ? speakerProfilesFromPlot(plot) : [],
      binding.speakerProfiles ?? [],
    );
    if (speakerProfiles.length === 0) {
      return;
    }

    binding.speakerProfiles = speakerProfiles;
    binding.updatedAt = new Date().toISOString();
    const bindings = await this.getBindings();
    bindings[conversationId] = binding;
    await this.putBindings(bindings);
  }

  private async collectIntroMessages(
    zeta: ZetaClient,
    talkId: string,
  ): Promise<ZetaMessage[]> {
    const talk = zeta.talk.fromId(talkId);
    const fromCreate = await talk
      .createIntro()
      .then((result) => readIntroMessages(result.data))
      .catch(() => []);
    if (fromCreate.length > 0) {
      return fromCreate;
    }

    const beforeSelection = await talk
      .getIntroBeforeSelection()
      .then((result) => readIntroMessages(result.data))
      .catch(() => []);
    if (beforeSelection.length > 0) {
      return beforeSelection;
    }

    const messages = await talk
      .listMessages({ limit: 10 })
      .then((result) => result.data.messages)
      .catch(() => []);
    return messages.filter((message) => message.isIntro);
  }

  private async hydratePlot(zeta: ZetaClient, plot: Plot): Promise<Plot> {
    const plotId = plot.id ?? plot.plotId;
    if (!plotId) {
      return plot;
    }

    return await zeta.plots
      .get(plotId)
      .then((resource) => resource.data ?? plot)
      .catch(() => plot);
  }

  private async displayNameForSource(
    source: LineSource | undefined,
  ): Promise<string> {
    if (!source || !("userId" in source) || !source.userId) {
      return "あなた";
    }

    const profile = await this.line.getProfile(source).catch(() => undefined);
    return profile?.displayName?.trim() || "あなた";
  }

  private async createZetaClient(): Promise<ZetaClient> {
    if (this.zeta) return this.zeta;

    const stored = await this.state.storage.get<ZetaTokens>(TOKENS_KEY);
    const accessToken = stored?.accessToken;
    const refreshToken = stored?.refreshToken;
    const deviceId = stored?.deviceId;
    const clientVersion = await this.latestIosClientVersion();

    if (!accessToken && !refreshToken) {
      throw new Error("ZETA_ACCESS_TOKEN or stored Zeta token is required.");
    }

    this.zeta = new ZetaClient({
      token: accessToken,
      refreshToken,
      deviceId,
      deviceType: "ios",
      clientVersion,
      clientNativeVersion: clientVersion,
      fetch: (input, init) => fetch(input, init),
      userLanguage: "JAPANESE",
      onTokenUpdate: async (tokens) => this.updateZetaTokens(tokens, deviceId),
    });
    return this.zeta;
  }

  private async latestIosClientVersion(): Promise<string | undefined> {
    const cached = await this.state.storage.get<string>(IOS_CLIENT_VERSION_KEY);
    const version = await fetchLatestIosClientVersion((input, init) =>
      fetch(input, init),
    ).catch(() => undefined);
    if (version) {
      await this.state.storage.put(IOS_CLIENT_VERSION_KEY, version);
      return version;
    }
    return cached;
  }

  private async updateZetaTokens(
    tokens: TokenPair,
    previousDeviceId: string | undefined,
  ): Promise<void> {
    const previous = await this.state.storage.get<ZetaTokens>(TOKENS_KEY);
    await this.state.storage.put<ZetaTokens>(TOKENS_KEY, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? previous?.refreshToken,
      deviceId: previous?.deviceId ?? previousDeviceId,
      updatedAt: new Date().toISOString(),
    });
  }

  private async setInitialZetaCredential(
    credential: ZetaCredentialInput,
  ): Promise<void> {
    const accessToken = firstText(credential.accessToken, credential.token);
    const refreshToken = firstText(
      credential.refreshToken,
      credential.refresh_token,
    );
    const deviceId = firstText(credential.deviceId, credential.device_id);

    if (!accessToken || !refreshToken || !deviceId) {
      throw new Error(
        "Zeta credential must include token, refresh_token, and device_id.",
      );
    }

    await this.state.storage.put<ZetaTokens>(TOKENS_KEY, {
      accessToken,
      refreshToken,
      deviceId,
      updatedAt: new Date().toISOString(),
    });
  }

  private async getBindings(): Promise<Record<string, ConversationBinding>> {
    return (
      (await this.state.storage.get<Record<string, ConversationBinding>>(
        BINDINGS_KEY,
      )) ?? {}
    );
  }

  private async putBindings(
    bindings: Record<string, ConversationBinding>,
  ): Promise<void> {
    await this.state.storage.put(BINDINGS_KEY, bindings);
  }

  private async updateChatProfileNameIfChanged(
    zeta: ZetaClient,
    conversationId: string,
    binding: ConversationBinding,
    source: LineSource,
  ): Promise<void> {
    if (!binding.userChatProfileId) {
      return;
    }

    const nextName = await this.chatProfileNameForSource(source);
    if (nextName === binding.userChatProfileName) {
      return;
    }

    await zeta.profile.chatProfiles
      .fromId(binding.userChatProfileId)
      .update({ name: nextName })
      .catch(async (error) => {
        console.error(
          "failed to update zeta chat profile name",
          describeError(error),
        );
        await zeta.profile.chatProfiles
          .fromId(binding.userChatProfileId!)
          .update({ name: "LINE User" });
      });
    binding.userChatProfileName = nextName;
    binding.updatedAt = new Date().toISOString();
    const bindings = await this.getBindings();
    bindings[conversationId] = binding;
    await this.putBindings(bindings);
  }

  private async replyAndRemember(
    replyToken: string,
    source: LineSource | undefined,
    messages: Parameters<LineService["replyMessage"]>[1],
    conversationId = conversationIdFromSource(source),
    alreadyDeliveredCount = 0,
    totalMessageCount = messages.length,
  ): Promise<void> {
    const messagesToSend = await this.prepareMessagesPage(
      conversationId,
      messages,
      alreadyDeliveredCount,
      totalMessageCount,
    );
    await this.withUnlinkQuickReply(conversationId, messagesToSend);
    const sentMessageIds = await this.line.replyMessage(
      replyToken,
      messagesToSend,
    );
    await this.rememberLastGroupBotMessageId(source, sentMessageIds.at(-1));
  }

  private async replyContinuation(
    replyToken: string,
    source: LineSource | undefined,
    conversationId: string,
    continuationId: string | null,
  ): Promise<void> {
    if (!continuationId) {
      await this.replyAndRemember(replyToken, source, [
        buildSystemMessage("続きが見つかりませんでした"),
      ]);
      return;
    }

    const continuations = await this.getContinuations();
    const continuation = continuations[continuationId];
    if (!continuation || continuation.conversationId !== conversationId) {
      await this.replyAndRemember(replyToken, source, [
        buildSystemMessage("続きが見つかりませんでした"),
      ]);
      return;
    }

    delete continuations[continuationId];
    await this.state.storage.put(CONTINUATIONS_KEY, continuations);
    await this.replyAndRemember(
      replyToken,
      source,
      continuation.messages,
      conversationId,
      continuation.deliveredCount,
      continuation.totalCount,
    );
  }

  private async prepareMessagesPage(
    conversationId: string | undefined,
    messages: Parameters<LineService["replyMessage"]>[1],
    alreadyDeliveredCount = 0,
    totalMessageCount = messages.length,
  ): Promise<Parameters<LineService["replyMessage"]>[1]> {
    if (messages.length <= MAX_LINE_MESSAGES || !conversationId) {
      return messages.slice(0, MAX_LINE_MESSAGES);
    }

    const firstPage = messages.slice(0, MAX_LINE_MESSAGES);
    const rest = messages.slice(MAX_LINE_MESSAGES);
    const deliveredCount = alreadyDeliveredCount + firstPage.length;
    const continuationId = crypto.randomUUID();
    const continuations = await this.getContinuations();
    continuations[continuationId] = {
      conversationId,
      messages: rest,
      deliveredCount,
      totalCount: totalMessageCount,
      createdAt: new Date().toISOString(),
    };
    await this.state.storage.put(CONTINUATIONS_KEY, continuations);

    const last = firstPage.at(-1);
    if (last) {
      const continuationQuickReplyItems =
        continuationQuickReply(
          continuationId,
          deliveredCount,
          totalMessageCount,
        ).items ?? [];
      last.quickReply = {
        items: [
          ...(last.quickReply?.items ?? []),
          ...continuationQuickReplyItems,
        ].slice(0, 13),
      };
    }
    return firstPage;
  }

  private async withUnlinkQuickReply(
    conversationId: string | undefined,
    messages: Parameters<LineService["replyMessage"]>[1],
  ): Promise<void> {
    if (!conversationId) {
      return;
    }

    const bindings = await this.getBindings();
    if (!bindings[conversationId]) {
      return;
    }

    const last = messages.at(-1);
    if (!last) {
      return;
    }

    if (hasUnlinkQuickReply(last)) {
      return;
    }

    const unlinkItems = unlinkQuickReply().items ?? [];
    last.quickReply = {
      items: [...(last.quickReply?.items ?? []), ...unlinkItems].slice(0, 13),
    };
  }

  private async getContinuations(): Promise<
    Record<string, ContinuationRecord>
  > {
    const continuations =
      (await this.state.storage.get<Record<string, ContinuationRecord>>(
        CONTINUATIONS_KEY,
      )) ?? {};
    const cutoff = Date.now() - 15 * 60 * 1000;
    let changed = false;
    for (const [id, continuation] of Object.entries(continuations)) {
      if (Date.parse(continuation.createdAt) < cutoff) {
        delete continuations[id];
        changed = true;
      }
    }
    if (changed) {
      await this.state.storage.put(CONTINUATIONS_KEY, continuations);
    }
    return continuations;
  }

  private async rememberLastGroupBotMessageId(
    source: LineSource | undefined,
    messageId: string | undefined,
  ): Promise<void> {
    const conversationId = conversationIdFromSource(source);
    if (!messageId || !conversationId || !source || source.type === "user") {
      return;
    }

    const ids = await this.getLastGroupBotMessageIds();
    ids[conversationId] = messageId;
    await this.state.storage.put(GROUP_LAST_BOT_MESSAGE_IDS_KEY, ids);
  }

  private async isQuotedLastBotMessage(
    conversationId: string,
    message: LineTextMessage,
  ): Promise<boolean> {
    if (!message.quotedMessageId) {
      return false;
    }

    const ids = await this.getLastGroupBotMessageIds();
    return ids[conversationId] === message.quotedMessageId;
  }

  private async getLastGroupBotMessageIds(): Promise<Record<string, string>> {
    return (
      (await this.state.storage.get<Record<string, string>>(
        GROUP_LAST_BOT_MESSAGE_IDS_KEY,
      )) ?? {}
    );
  }

  private async chatProfileNameForSource(
    source: LineSource | undefined,
  ): Promise<string> {
    if (!source) {
      return "LINE";
    }

    let rawName: string;
    if (source.type === "group") {
      const summary = await this.line
        .getGroupSummary(source.groupId)
        .catch(() => undefined);
      rawName = summary?.groupName?.trim() || "LINE Group";
    } else {
      rawName = await this.displayNameForSource(source);
    }

    return sanitizeZetaChatProfileName(rawName);
  }

  private async createChatProfile(
    zeta: ZetaClient,
    name: string,
    sourceLabel: string,
  ) {
    return await zeta.profile.chatProfiles
      .create({
        name,
        description: `LINE ${sourceLabel} 用`,
      })
      .catch(async (error) => {
        console.error(
          "failed to create zeta chat profile with source name",
          describeError(error),
        );
        return await zeta.profile.chatProfiles.create({
          name: "LINE User",
          description: `LINE ${sourceLabel} 用`,
        });
      });
  }

  private get line(): LineService {
    return new LineService(this.env.CHANNEL_ACCESS_TOKEN);
  }
}

function messageMentionsBot(
  message: LineTextMessage,
  botUserId: string | undefined,
): boolean {
  return (message.mention?.mentionees ?? []).some((mentionee) => {
    if (mentionee.type === "all") return true;
    return Boolean(
      botUserId && "userId" in mentionee && mentionee.userId === botUserId,
    );
  });
}

function stripBotMentions(
  message: LineTextMessage,
  botUserId: string | undefined,
): string {
  let text = message.text;
  const mentionees = [...(message.mention?.mentionees ?? [])]
    .filter(
      (mentionee) =>
        mentionee.type === "all" ||
        (botUserId && "userId" in mentionee && mentionee.userId === botUserId),
    )
    .flatMap((mentionee) =>
      typeof mentionee.index === "number" &&
      typeof mentionee.length === "number"
        ? [{ index: mentionee.index, length: mentionee.length }]
        : [],
    )
    .sort((a, b) => b.index - a.index);

  for (const mentionee of mentionees) {
    text = `${text.slice(0, mentionee.index)}${text.slice(mentionee.index + mentionee.length)}`;
  }

  return text.replace(/\s+/g, " ").trim();
}

function normalizeRetryText(text: string): string {
  const retryText = text.replace(/\s+/g, " ").trim();
  return retryText;
}

function hasUnlinkQuickReply(
  message: Parameters<LineService["replyMessage"]>[1][number],
): boolean {
  return (message.quickReply?.items ?? []).some((item) => {
    const action = item.action;
    return (
      action?.type === "postback" &&
      typeof action.data === "string" &&
      new URLSearchParams(action.data).get("action") === "unlink"
    );
  });
}

function sanitizeZetaChatProfileName(value: string): string {
  const normalized = value
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s_-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  return truncate(normalized || "LINE User", 20);
}

function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { message: String(error) };
}
