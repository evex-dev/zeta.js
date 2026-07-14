import { groupSpeechSegmentsForDisplay, parseMarkdownDisplay, speechBlocksFromSegments, toggleDescriptionAtSelection } from "./script.ts";
import type { CastMember, NarrationMode, SpeechBlock, SpeechSegment, VoiceSetting, VoicevoxSpeaker } from "./types.ts";
import { migrateVoiceSetting } from "./voice-settings.ts";

type StoryMessage = {
  id: string;
  text: string;
  element: HTMLElement;
  override: string;
  speakerName?: string;
  segments?: SpeechSegment[];
};

type CharacterView = { id?: string; name: string; imageUrl?: string; description?: string };
type PlotView = { id: string; title: string; description: string; imageUrl?: string; characters: CharacterView[] };
type HistoryMessage = { id: string; direction: "user" | "assistant"; text: string; speakerName?: string; createdAt?: string; isIntro: boolean; segments: SpeechSegment[] };
type RoomView = { roomId: string; plot: PlotView; characters: CharacterView[]; messages: HistoryMessage[] };
type RoomSummary = { roomId: string; plot: PlotView; lastMessage?: string; updatedAt?: string };
type ConnectionInfo = { state: "connected" | "not_configured" | "error"; label: string; detail?: string };

const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;
const roomInput = $("#room-id") as HTMLInputElement;
const input = $("#message-input") as HTMLTextAreaElement;
const composer = $("#composer") as HTMLFormElement;
const transcript = $("#transcript") as HTMLElement;
const emptyState = $("#empty-state") as HTMLElement;
const notice = $("#notice") as HTMLElement;
const player = $(".player-card") as HTMLElement;
const playStatus = $("#play-status") as HTMLElement;
const speakerInitial = $("#speaker-initial") as HTMLElement;
const pauseButton = $("#pause-button") as HTMLButtonElement;
const restartButton = $("#restart-button") as HTMLButtonElement;
const castDialog = $("#cast-dialog") as HTMLDialogElement;
const castList = $("#cast-list") as HTMLElement;
const recognitionActions = $("#recognition-actions") as HTMLElement;
const searchDialog = $("#search-dialog") as HTMLDialogElement;
const searchInput = $("#plot-search-input") as HTMLInputElement;
const searchStatus = $("#search-status") as HTMLElement;
const plotResults = $("#plot-results") as HTMLElement;
const roomDialog = $("#room-dialog") as HTMLDialogElement;
const roomStatus = $("#room-status") as HTMLElement;
const roomResults = $("#room-results") as HTMLElement;

let voicevoxSpeakers: VoicevoxSpeaker[] = [];
let characterNames: string[] = [];
let characters: CharacterView[] = [];
let currentPlot: PlotView | undefined;
let cast = new Map<string, CastMember>();
let narrationMode: NarrationMode = "read";
let assistantMessages: StoryMessage[] = [];
let latestTurnMessages: StoryMessage[] = [];
let submitting = false;

class AudioVisualizer {
  private context?: AudioContext;
  private analyser?: AnalyserNode;
  private frame?: number;
  private readonly bars = Array.from(document.querySelectorAll<HTMLElement>("#waveform i"));

  async unlock(): Promise<void> {
    const AudioContextConstructor = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    this.context ??= new AudioContextConstructor();
    if (this.context.state === "suspended") await this.context.resume().catch(() => undefined);
  }

  async attach(audio: HTMLAudioElement): Promise<void> {
    await this.unlock();
    if (!this.context || this.context.state !== "running") {
      player.classList.add("visualizer-fallback");
      return;
    }
    player.classList.remove("visualizer-fallback");
    const analyser = this.context.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.72;
    const source = this.context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(this.context.destination);
    this.analyser = analyser;
    this.start();
  }

  start(): void {
    if (!this.analyser || this.frame !== undefined) return;
    const values = new Uint8Array(this.analyser.frequencyBinCount);
    const draw = () => {
      this.analyser?.getByteFrequencyData(values);
      for (const [index, bar] of this.bars.entries()) {
        const bin = Math.min(values.length - 1, 1 + Math.floor(index * values.length / this.bars.length));
        const level = (values[bin] ?? 0) / 255;
        bar.style.transform = `scaleY(${0.22 + level * 1.3})`;
        bar.style.opacity = String(0.42 + level * 0.58);
      }
      this.frame = requestAnimationFrame(draw);
    };
    draw();
  }

  stop(): void {
    this.pause();
    this.analyser?.disconnect();
    this.analyser = undefined;
  }

  pause(): void {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    this.frame = undefined;
    for (const bar of this.bars) {
      bar.style.transform = "scaleY(.25)";
      bar.style.opacity = ".45";
    }
  }
}

const audioVisualizer = new AudioVisualizer();
window.addEventListener("pointerdown", () => void audioVisualizer.unlock(), { once: true });
window.addEventListener("keydown", () => void audioVisualizer.unlock(), { once: true });

class DramaPlayer {
  private generation = 0;
  private audio?: HTMLAudioElement;
  private finishCurrent?: () => void;
  private paused = false;
  private last?: { message: StoryMessage; blocks: SpeechBlock[] };

  async play(message: StoryMessage, blocks: SpeechBlock[], remember = true): Promise<void> {
    await this.stop(false);
    const generation = ++this.generation;
    this.paused = false;
    if (remember) this.last = { message, blocks };
    pauseButton.disabled = false;
    restartButton.disabled = false;

    const selected = message.override === "off" ? [] : blocks;
    if (selected.length > 0) setPlayerState("preparing", "声を準備しています…", "Zeta");
    const prepared = selected.map((block) => {
      const member = resolveCast(block, message.override);
      return this.fetchSpeech(message, block, member).then(
        (blob) => ({ ok: true as const, block, member, blob }),
        (error: unknown) => ({ ok: false as const, block, member, error }),
      );
    });

    for (const pending of prepared) {
      if (generation !== this.generation) return;
      const speech = await pending;
      if (generation !== this.generation) return;
      if (!speech.ok) {
        showNotice(`${speech.member.label}の音声を準備できません: ${errorMessage(speech.error)}`, true);
        continue;
      }
      const { block, member, blob } = speech;
      await delay(block.pauseBeforeMs);
      if (generation !== this.generation) return;
      try {
        await this.playBlob(blob, member, block, generation);
        if (generation !== this.generation) return;
        await delay(block.pauseAfterMs);
      } catch (error) {
        if (generation !== this.generation) return;
        if (isAbortError(error)) {
          try {
            await this.playBlob(blob, member, block, generation);
            if (generation !== this.generation) return;
            await delay(block.pauseAfterMs);
            continue;
          } catch (retryError) {
            if (generation !== this.generation) return;
            showNotice(`${member.label}の再生を再試行できません: ${errorMessage(retryError)}`, true);
            continue;
          }
        }
        showNotice(`${member.label}の音声を再生できません: ${errorMessage(error)}`, true);
      }
    }
    if (generation === this.generation) setPlayerState("idle", "続きを待っています", "Zeta");
  }

  private async fetchSpeech(message: StoryMessage, block: SpeechBlock, member: CastMember): Promise<Blob> {
    const response = await fetch("/api/speech", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        messageId: `${message.id}:${block.id}`,
        text: block.text,
        voice: member.voice,
      }),
    });
    if (!response.ok) throw new Error(await responseError(response));
    return await response.blob();
  }

  private async playBlob(blob: Blob, member: CastMember, block: SpeechBlock, generation: number): Promise<void> {
    const url = URL.createObjectURL(blob);
    const audio = new Audio();
    audio.preload = "auto";
    audio.src = url;
    audio.volume = Math.min(1, member.voice.volumeScale * block.volumeScale);
    this.audio = audio;
    try {
      await this.waitUntilReady(audio);
      if (generation !== this.generation) return;
      await audioVisualizer.attach(audio);
      if (generation !== this.generation) return;
      const ended = new Promise<void>((resolve, reject) => {
        this.finishCurrent = resolve;
        audio.onended = () => resolve();
        audio.onerror = () => reject(mediaError(audio));
      });
      setPlayerState("playing", `${member.label}が話しています`, member.label);
      await audio.play();
      await ended;
    } finally {
      this.finishCurrent = undefined;
      audio.onended = null;
      audio.onerror = null;
      audioVisualizer.stop();
      player.classList.remove("is-playing");
      if (this.audio === audio) this.audio = undefined;
      URL.revokeObjectURL(url);
    }
  }

  private async waitUntilReady(audio: HTMLAudioElement): Promise<void> {
    if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return;
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => finish(() => reject(new Error("音声の読み込みがタイムアウトしました"))), 15_000);
      const finish = (action: () => void) => {
        window.clearTimeout(timeout);
        audio.removeEventListener("loadeddata", loaded);
        audio.removeEventListener("error", failed);
        this.finishCurrent = undefined;
        action();
      };
      const loaded = () => finish(resolve);
      const failed = () => finish(() => reject(mediaError(audio)));
      this.finishCurrent = () => finish(resolve);
      audio.addEventListener("loadeddata", loaded, { once: true });
      audio.addEventListener("error", failed, { once: true });
      audio.load();
    });
  }

  async stop(fade = true): Promise<void> {
    this.generation += 1;
    const finishCurrent = this.finishCurrent;
    const audio = this.audio;
    this.audio = undefined;
    if (audio) {
      if (fade && !audio.paused) {
        const startVolume = audio.volume;
        const started = performance.now();
        await new Promise<void>((resolve) => {
          const step = (now: number) => {
            const progress = Math.min(1, (now - started) / 160);
            audio.volume = startVolume * (1 - progress);
            if (progress < 1) requestAnimationFrame(step); else resolve();
          };
          requestAnimationFrame(step);
        });
      }
      audio.pause();
    }
    finishCurrent?.();
    this.finishCurrent = undefined;
    audioVisualizer.stop();
    this.paused = false;
    pauseButton.textContent = "Ⅱ";
    player.classList.remove("is-playing");
  }

  togglePause(): void {
    if (!this.audio) return;
    if (this.audio.paused) {
      void this.audio.play();
      this.paused = false;
      pauseButton.textContent = "Ⅱ";
      player.classList.add("is-playing");
      audioVisualizer.start();
      playStatus.textContent = `${player.dataset.speaker ?? "キャラクター"}が話しています`;
    } else {
      this.audio.pause();
      this.paused = true;
      pauseButton.textContent = "▶";
      player.classList.remove("is-playing");
      audioVisualizer.pause();
      playStatus.textContent = "一時停止しています";
    }
  }

  restart(): void {
    if (this.last) void this.play(this.last.message, this.last.blocks, false);
  }
}

const dramaPlayer = new DramaPlayer();

await initialize();

async function initialize(): Promise<void> {
  bindEvents();
  void refreshConnectionStatus();
  try {
    const config = await fetchJson<{ roomId?: string }>("/api/config");
    roomInput.value = localStorage.getItem("zeta-voice:room") ?? config.roomId ?? "";
  } catch { /* The UI remains usable for the local sample. */ }

  const [voiceResult] = await Promise.allSettled([
    fetchJson<VoicevoxSpeaker[]>("/api/voicevox/speakers"),
    roomInput.value ? loadRoom(roomInput.value) : Promise.resolve(),
  ]);
  if (voiceResult.status === "fulfilled") {
    voicevoxSpeakers = voiceResult.value;
    showNotice("VOICEVOXと接続しました。物語を始められます。");
  } else {
    showNotice("VOICEVOXに接続できません。起動後にキャスティングを開いて再試行してください。", true);
  }
  restoreCast();
  renderCast();
}

function bindEvents(): void {
  composer.addEventListener("submit", (event) => { event.preventDefault(); void submit(input.value); });
  input.addEventListener("focus", () => void dramaPlayer.stop(true));
  input.addEventListener("pointerdown", () => void dramaPlayer.stop(true));
  input.addEventListener("input", () => { resizeInput(); syncDescriptionButton(); });
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.shiftKey && !event.isComposing) {
      event.preventDefault();
      composer.requestSubmit();
    }
  });
  input.addEventListener("click", syncDescriptionButton);
  input.addEventListener("keyup", syncDescriptionButton);
  $("#description-button").addEventListener("click", makeDescription);
  $("#continue-button").addEventListener("click", () => void submit("*私は黙ったまま、相手の続きを待つ。*"));
  $("#cast-button").addEventListener("click", () => void openCasting());
  $("#plot-search-button").addEventListener("click", openPlotSearch);
  $("#empty-search-button").addEventListener("click", openPlotSearch);
  $("#room-select-button").addEventListener("click", openRoomSelector);
  $("#empty-room-button").addEventListener("click", openRoomSelector);
  $("#plot-search-form").addEventListener("submit", (event) => { event.preventDefault(); void performPlotSearch(); });
  $("#room-open-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const roomId = roomInput.value.trim();
    if (roomId) void loadRoom(roomId).then((loaded) => { if (loaded) roomDialog.close(); });
  });
  $("#status-refresh").addEventListener("click", () => void refreshConnectionStatus());
  $("#save-cast").addEventListener("click", saveCasting);
  $("#sample-button").addEventListener("click", playSample);
  pauseButton.addEventListener("click", () => dramaPlayer.togglePause());
  restartButton.addEventListener("click", () => dramaPlayer.restart());
  for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="narration"]')) {
    radio.addEventListener("change", () => { narrationMode = radio.value as NarrationMode; });
  }
  setupSpeechRecognition();
}

async function refreshConnectionStatus(): Promise<void> {
  const refresh = $("#status-refresh") as HTMLButtonElement;
  refresh.disabled = true;
  setConnectionBadge("zeta-status", { state: "not_configured", label: "確認中" }, true);
  setConnectionBadge("voicevox-status", { state: "not_configured", label: "確認中" }, true);
  try {
    const status = await fetchJson<{ zeta: ConnectionInfo; voicevox: ConnectionInfo }>("/api/status");
    setConnectionBadge("zeta-status", status.zeta);
    setConnectionBadge("voicevox-status", status.voicevox);
  } catch (error) {
    const unavailable = { state: "error" as const, label: "確認失敗", detail: errorMessage(error) };
    setConnectionBadge("zeta-status", unavailable);
    setConnectionBadge("voicevox-status", unavailable);
  } finally {
    refresh.disabled = false;
  }
}

function setConnectionBadge(id: string, status: ConnectionInfo, checking = false): void {
  const badge = $(`#${id}`) as HTMLElement;
  badge.classList.remove("connected", "not-configured", "error", "checking");
  badge.classList.add(checking ? "checking" : status.state === "not_configured" ? "not-configured" : status.state);
  const value = badge.querySelector("strong");
  if (value) value.textContent = status.label;
  badge.title = status.detail ?? status.label;
}

async function submit(rawText: string): Promise<void> {
  const text = rawText.trim();
  const roomId = roomInput.value.trim();
  if (!text || submitting) return;
  if (!roomId) {
    roomInput.focus();
    showNotice("先にZetaのルームIDを入力してください。", true);
    return;
  }

  submitting = true;
  input.value = "";
  syncDescriptionButton();
  recognitionActions.hidden = true;
  resizeInput();
  await dramaPlayer.stop(true);
  appendMessage("user", text, crypto.randomUUID());
  const assistant = appendMessage("assistant", "", crypto.randomUUID());
  assistant.element.classList.add("streaming");
  setPlayerState("preparing", "物語の続きを紡いでいます…", "Zeta");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ roomId, text }),
    });
    if (!response.ok || !response.body) throw new Error(await responseError(response));
    await readSse(response.body, (update) => {
      if (typeof update.text === "string") {
        assistant.text = update.text;
        if (typeof update.messageId === "string") assistant.id = update.messageId;
        if (Array.isArray(update.segments)) {
          assistant.segments = update.segments as SpeechSegment[];
          assistant.speakerName = assistant.segments.find((segment) => segment.speakerName)?.speakerName;
          updateMessageIdentity(assistant, "assistant");
        }
        renderMessageBody(assistant.element.querySelector(".message-body") as HTMLElement, assistant.text);
      }
    });
    if (!assistant.text) throw new Error("Zetaから空の応答が返りました");
    assistant.element.classList.remove("streaming");
    replaceAssistantWithUnits(assistant);
    replayLatestTurn();
  } catch (error) {
    assistant.element.remove();
    assistantMessages = assistantMessages.filter((item) => item !== assistant);
    latestTurnMessages = latestTurnMessages.filter((item) => item !== assistant);
    refreshReplayButton();
    showNotice(errorMessage(error), true);
    setPlayerState("idle", "物語を待っています", "Zeta");
  } finally {
    submitting = false;
  }
}

function appendMessage(role: "user" | "assistant", text: string, id: string, options: { speakerName?: string; createdAt?: string; segments?: SpeechSegment[] } = {}): StoryMessage {
  emptyState.hidden = true;
  const template = $("#message-template") as HTMLTemplateElement;
  const element = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
  element.classList.add(role);
  element.querySelector(".message-time")!.textContent = new Intl.DateTimeFormat("ja", { hour: "2-digit", minute: "2-digit" }).format(options.createdAt ? new Date(options.createdAt) : new Date());
  renderMessageBody(element.querySelector(".message-body") as HTMLElement, text);
  if (role === "user") element.querySelector(".message-actions")?.remove();
  transcript.appendChild(element);
  const message = { id, text, element, override: "auto", speakerName: options.speakerName, segments: options.segments };
  updateMessageIdentity(message, role);
  if (role === "assistant") {
    assistantMessages.push(message);
    latestTurnMessages.push(message);
  } else {
    latestTurnMessages = [];
    refreshReplayButton();
  }
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  return message;
}

function updateMessageIdentity(message: StoryMessage, role: "user" | "assistant"): void {
  const metadataName = message.segments?.find((segment) => segment.speakerName)?.speakerName;
  const speakerName = metadataName ?? message.speakerName;
  const narrator = message.segments?.some((segment) => segment.position?.toUpperCase() === "NARRATOR" || segment.speakerName === "ナレーター") ?? false;
  message.speakerName = speakerName;
  message.element.classList.toggle("narrator", role === "assistant" && narrator);
  message.element.classList.toggle("character", role === "assistant" && !narrator);
  const roleElement = message.element.querySelector(".message-role");
  if (roleElement) roleElement.textContent = role === "user" ? "あなた" : narrator ? "ナレーター" : speakerName ?? characters[0]?.name ?? "Zeta";
  const avatar = message.element.querySelector(".message-avatar") as HTMLImageElement | null;
  if (!avatar || role === "user") return;
  const avatarUrl = characterImage(speakerName) ?? currentPlot?.imageUrl;
  avatar.hidden = !avatarUrl;
  if (avatarUrl) avatar.src = avatarUrl;
}

function replaceAssistantWithUnits(message: StoryMessage): StoryMessage[] {
  const segments = message.segments?.length
    ? message.segments
    : [{ text: message.text, speakerName: message.speakerName ?? characterNames[0], position: "LEFT" }];
  const units = appendAssistantBubbles(message.id, segments);
  message.element.remove();
  assistantMessages = assistantMessages.filter((item) => item !== message);
  latestTurnMessages = latestTurnMessages.filter((item) => item !== message);
  refreshReplayButton();
  return units;
}

function appendAssistantBubbles(id: string, segments: SpeechSegment[], createdAt?: string): StoryMessage[] {
  const groups = groupSpeechSegmentsForDisplay(segments);
  const messages = groups.map((group, index) => {
    const text = group.map((segment) => segment.text).join("\n");
    const message = appendMessage("assistant", text, `${id}:${index + 1}`, {
      speakerName: group[0]?.speakerName,
      createdAt,
      segments: group,
    });
    updateMessageActions(message);
    return message;
  });
  refreshReplayButton();
  return messages;
}

function refreshReplayButton(): void {
  for (const message of assistantMessages) {
    const button = message.element.querySelector(".replay-message") as HTMLButtonElement | null;
    if (button) button.hidden = message !== latestTurnMessages.at(-1);
  }
}

function replayLatestTurn(): void {
  const source = latestTurnMessages.filter((message) => message.override !== "off");
  const first = source[0];
  if (!first) return;
  const blocks: SpeechBlock[] = [];
  for (const [messageIndex, message] of source.entries()) {
    const messageBlocks = speechBlocksForMessage(message).map((block, blockIndex) => ({
      ...applySpeakerOverride(block, message.override),
      id: `message-${messageIndex + 1}-speech-${blockIndex + 1}`,
    }));
    const previous = blocks.at(-1);
    const next = messageBlocks[0];
    if (previous && next) next.pauseBeforeMs = Math.max(next.pauseBeforeMs, previous.role === "narrator" && next.role === "character" ? 620 : 460);
    blocks.push(...messageBlocks);
  }
  const playbackMessage = { ...first, id: `turn-${source.map((message) => message.id).join("-")}`, override: "auto" };
  void dramaPlayer.play(playbackMessage, blocks);
}

function applySpeakerOverride(block: SpeechBlock, override: string): SpeechBlock {
  if (override === "auto") return block;
  if (override === "narrator") return { ...block, role: "narrator", speakerName: undefined };
  const member = cast.get(override);
  return member ? { ...block, role: "character", speakerName: member.characterName } : block;
}

function speechBlocksForMessage(message: StoryMessage): SpeechBlock[] {
  const segments = message.segments?.length
    ? message.segments
    : [{ text: message.text, speakerName: message.speakerName ?? characterNames[0], position: "LEFT" }];
  return speechBlocksFromSegments(segments, narrationMode);
}

function renderMessageBody(element: HTMLElement, markdown: string): void {
  element.replaceChildren();
  for (const part of parseMarkdownDisplay(markdown)) {
    if (!part.italic) {
      element.appendChild(document.createTextNode(part.text));
      continue;
    }
    const em = document.createElement("em");
    em.textContent = part.text;
    element.appendChild(em);
  }
}

function updateMessageActions(message: StoryMessage): void {
  const select = message.element.querySelector(".speaker-override") as unknown as HTMLSelectElement;
  select.replaceChildren(option("auto", "自動"), option("narrator", "ナレーター"));
  for (const member of cast.values()) {
    if (member.key !== "narrator") select.appendChild(option(member.key, member.label));
  }
  select.appendChild(option("off", "読み上げない"));
  select.value = message.override;
  select.addEventListener("change", () => {
    message.override = select.value;
    void dramaPlayer.play(message, speechBlocksForMessage(message));
  });
  message.element.querySelector(".replay-message")?.addEventListener("click", () => {
    replayLatestTurn();
  });
}

async function openCasting(): Promise<void> {
  castDialog.showModal();
  if (voicevoxSpeakers.length === 0) {
    castList.innerHTML = '<div class="loading-line">VOICEVOXを探しています…</div>';
    try {
      voicevoxSpeakers = await fetchJson<VoicevoxSpeaker[]>("/api/voicevox/speakers");
      restoreCast();
      renderCast();
    } catch (error) {
      castList.innerHTML = `<div class="loading-line">${escapeHtml(errorMessage(error))}</div>`;
    }
  }
}

async function loadRoom(roomId: string): Promise<boolean> {
  try {
    const data = await fetchJson<RoomView>(`/api/rooms/${encodeURIComponent(roomId)}`);
    await applyRoomView(data, false);
    return true;
  } catch (error) {
    showNotice(`ルームを読み込めません: ${errorMessage(error)}`, true);
    roomStatus.textContent = `読み込めませんでした: ${errorMessage(error)}`;
    return false;
  }
}

function openPlotSearch(): void {
  searchDialog.showModal();
  setTimeout(() => searchInput.focus(), 0);
}

function openRoomSelector(): void {
  roomDialog.showModal();
  void loadRoomList();
}

async function loadRoomList(): Promise<void> {
  roomStatus.textContent = "既存のルームを読み込んでいます…";
  roomResults.replaceChildren();
  try {
    const { rooms } = await fetchJson<{ rooms: RoomSummary[] }>("/api/rooms");
    roomStatus.textContent = rooms.length ? `${rooms.length}件のルーム` : "既存のルームはありません";
    for (const room of rooms) roomResults.appendChild(roomCard(room));
  } catch (error) {
    roomStatus.textContent = `ルーム一覧を取得できません: ${errorMessage(error)}`;
  }
}

function roomCard(room: RoomSummary): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "room-card";
  const media = room.plot.imageUrl
    ? `<img src="${escapeHtml(room.plot.imageUrl)}" alt="" />`
    : `<span class="room-card-placeholder">${escapeHtml(room.plot.title.slice(0, 1))}</span>`;
  const date = room.updatedAt ? new Intl.DateTimeFormat("ja", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(room.updatedAt)) : "";
  button.innerHTML = `${media}<span class="room-card-copy"><span class="room-card-heading"><strong>${escapeHtml(room.plot.title)}</strong><time>${escapeHtml(date)}</time></span><span class="room-card-message">${escapeHtml(room.lastMessage ?? "まだ会話がありません")}</span><small>${escapeHtml(room.roomId)}</small></span>`;
  button.addEventListener("click", async () => {
    button.disabled = true;
    roomStatus.textContent = `「${room.plot.title}」を開いています…`;
    if (await loadRoom(room.roomId)) roomDialog.close(); else button.disabled = false;
  });
  return button;
}

async function performPlotSearch(): Promise<void> {
  const keyword = searchInput.value.trim();
  if (!keyword) return;
  searchStatus.textContent = "検索しています…";
  plotResults.replaceChildren();
  try {
    const { plots } = await fetchJson<{ plots: PlotView[] }>(`/api/plots/search?q=${encodeURIComponent(keyword)}`);
    searchStatus.textContent = plots.length ? `${plots.length}件のプロットが見つかりました` : "プロットが見つかりませんでした";
    for (const plot of plots) plotResults.appendChild(plotCard(plot));
  } catch (error) {
    searchStatus.textContent = errorMessage(error);
  }
}

function plotCard(plot: PlotView): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "plot-card";
  const media = plot.imageUrl
    ? `<img src="${escapeHtml(plot.imageUrl)}" alt="" />`
    : '<span class="plot-card-placeholder">No image</span>';
  button.innerHTML = `${media}<span><h3>${escapeHtml(plot.title)}</h3><p>${escapeHtml(plot.description || "説明はありません")}</p><span class="plot-card-characters">${plot.characters.slice(0, 3).map((character) => `<span>${escapeHtml(character.name)}</span>`).join("")}</span></span>`;
  button.addEventListener("click", () => void selectPlot(plot, button));
  return button;
}

async function selectPlot(plot: PlotView, button: HTMLButtonElement): Promise<void> {
  button.disabled = true;
  searchStatus.textContent = `「${plot.title}」を始めています…`;
  try {
    const room = await requestJson<RoomView>(`/api/plots/${encodeURIComponent(plot.id)}/rooms`, { method: "POST" });
    await applyRoomView(room, true);
    searchDialog.close();
    showNotice("プロットから新しいルームを作成しました。");
  } catch (error) {
    button.disabled = false;
    searchStatus.textContent = errorMessage(error);
  }
}

async function applyRoomView(room: RoomView, playLatest: boolean): Promise<void> {
  await dramaPlayer.stop(false);
  roomInput.value = room.roomId;
  localStorage.setItem("zeta-voice:room", room.roomId);
  currentPlot = room.plot;
  characters = room.characters;
  characterNames = characters.map((character) => character.name);
  renderStoryContext();
  restoreCast();
  renderCast();
  transcript.querySelectorAll(".message").forEach((element) => element.remove());
  assistantMessages = [];
  latestTurnMessages = [];
  emptyState.hidden = true;
  for (const history of room.messages) {
    if (history.direction === "assistant") {
      appendAssistantBubbles(history.id, history.segments.length ? history.segments : [{ text: history.text, speakerName: history.speakerName, position: "LEFT" }], history.createdAt);
    } else {
      appendMessage("user", history.text, history.id, { createdAt: history.createdAt });
    }
  }
  if (playLatest) {
    const latest = assistantMessages.at(-1);
    if (latest) void dramaPlayer.play(latest, speechBlocksForMessage(latest));
  }
}

function renderStoryContext(): void {
  if (!currentPlot) return;
  const context = $("#story-context") as HTMLElement;
  context.hidden = false;
  $("#story-title").textContent = currentPlot.title;
  $("#plot-description").textContent = currentPlot.description;
  const plotImage = $("#plot-image") as HTMLImageElement;
  plotImage.src = currentPlot.imageUrl ?? "";
  plotImage.hidden = !currentPlot.imageUrl;
  const list = $("#character-list") as HTMLElement;
  list.replaceChildren();
  for (const character of characters) {
    const chip = document.createElement("span");
    chip.className = "character-chip";
    if (character.imageUrl) {
      const image = document.createElement("img");
      image.src = character.imageUrl;
      image.alt = "";
      chip.appendChild(image);
    } else {
      const placeholder = document.createElement("span");
      placeholder.className = "character-placeholder";
      placeholder.textContent = character.name.slice(0, 1);
      chip.appendChild(placeholder);
    }
    chip.appendChild(document.createTextNode(character.name));
    list.appendChild(chip);
  }
}

function restoreCast(): void {
  const keys = [
    { key: "narrator", label: "ナレーター" },
    { key: "main", label: characterNames[0] ?? "メインキャラクター", characterName: characterNames[0] },
    ...characterNames.slice(1).map((name) => ({ key: `character:${name}`, label: name, characterName: name })),
  ];
  const stored = localStorage.getItem(`zeta-voice:cast:${roomInput.value.trim() || "default"}`);
  const saved = stored ? safeParseCast(stored) : new Map<string, CastMember>();
  cast = new Map(keys.map((entry, index) => {
    const prior = saved.get(entry.key);
    const fallback = defaultCastMember(entry, index);
    return [entry.key, prior ? { ...fallback, ...prior, ...entry, voice: migrateVoiceSetting(prior.voice, fallback.voice, voicevoxSpeakers) } : fallback];
  }));
  localStorage.setItem(`zeta-voice:cast:${roomInput.value.trim() || "default"}`, JSON.stringify([...cast]));
  narrationMode = (localStorage.getItem("zeta-voice:narration") as NarrationMode | null) ?? "read";
  const radio = document.querySelector<HTMLInputElement>(`input[name="narration"][value="${narrationMode}"]`);
  if (radio) radio.checked = true;
}

function defaultCastMember(entry: { key: string; label: string; characterName?: string }, index: number): CastMember {
  const preferred = entry.key === "narrator" ? "玄野武宏" : index === 1 ? "四国めたん" : "青山龍星";
  const speaker = voicevoxSpeakers.find((item) => item.name === preferred) ?? voicevoxSpeakers[index % Math.max(1, voicevoxSpeakers.length)];
  const style = speaker?.styles[0];
  return {
    ...entry,
    voice: {
      speakerId: speaker?.speakerUuid ?? preferred,
      styleId: style?.id ?? (entry.key === "narrator" ? 11 : 2),
      speakerName: speaker?.name ?? preferred,
      styleName: style?.name ?? "ノーマル",
      speedScale: entry.key === "narrator" ? 0.92 : 1,
      pitchScale: 0,
      intonationScale: 1.15,
      volumeScale: 1,
    },
  };
}

function renderCast(): void {
  if (!voicevoxSpeakers.length) return;
  castList.replaceChildren();
  const styles = voicevoxSpeakers.flatMap((speaker) => speaker.styles.map((style) => ({ speaker, style })));
  for (const member of cast.values()) {
    const row = document.createElement("div");
    row.className = "cast-row";
    row.innerHTML = `<div class="cast-person"><strong>${escapeHtml(member.label)}</strong><small>${member.key === "narrator" ? "STORYTELLER" : "CHARACTER"}</small></div><div class="cast-controls"></div><button class="preview-voice" type="button" aria-label="${escapeHtml(member.label)}の声を試聴">▶</button>`;
    const controls = row.querySelector(".cast-controls") as HTMLElement;
    const voiceSelect = document.createElement("select");
    for (const { speaker, style } of styles) voiceSelect.appendChild(option(String(style.id), `${speaker.name} · ${style.name}`));
    voiceSelect.value = String(member.voice.styleId);
    voiceSelect.addEventListener("change", () => {
      const selected = styles.find(({ style }) => style.id === Number(voiceSelect.value));
      if (selected) Object.assign(member.voice, { speakerId: selected.speaker.speakerUuid, styleId: selected.style.id, speakerName: selected.speaker.name, styleName: selected.style.name });
    });
    controls.appendChild(labeledSelect("声 / 演じ方", voiceSelect));
    controls.appendChild(labeledSelect("話す速さ", semanticSelect([
      ["0.82", "ゆっくり"], ["1", "ふつう"], ["1.16", "はやめ"],
    ], member.voice.speedScale, (value) => { member.voice.speedScale = value; })));
    controls.appendChild(labeledSelect("感情", semanticSelect([
      ["0.9", "おだやか"], ["1.15", "自然"], ["1.4", "やや強め"],
    ], member.voice.intonationScale, (value) => { member.voice.intonationScale = value; })));
    row.querySelector(".preview-voice")?.addEventListener("click", () => previewVoice(member));
    castList.appendChild(row);
  }
}

function saveCasting(): void {
  localStorage.setItem(`zeta-voice:cast:${roomInput.value.trim() || "default"}`, JSON.stringify([...cast]));
  localStorage.setItem("zeta-voice:narration", narrationMode);
  castDialog.close();
  showNotice("キャストを保存しました。声の準備ができています。");
}

function previewVoice(member: CastMember): void {
  const sample = member.key === "narrator" ? "静かな夜に、物語が始まります。" : `こんにちは。${member.label}です。`;
  const message = { id: `preview-${Date.now()}`, text: sample, element: document.body, override: member.key };
  const block: SpeechBlock = { id: "preview", role: member.key === "narrator" ? "narrator" : "character", speakerName: member.characterName, text: sample, sourceText: sample, pauseBeforeMs: 0, pauseAfterMs: 0, volumeScale: 1 };
  void dramaPlayer.play(message, [block], false);
}

function playSample(): void {
  const text = "*雨の音が窓を叩く。彼女は少し目を伏せた。*\n\n「本当に、行くの？」";
  const id = `sample-${Date.now()}`;
  const segments: SpeechSegment[] = [
    { text: "雨の音が窓を叩く。彼女は少し目を伏せた。", speakerName: "ナレーター", position: "NARRATOR" },
    { text: "本当に、行くの？", speakerName: characterNames[0] ?? "キャラクター", position: "LEFT" },
  ];
  latestTurnMessages = [];
  appendAssistantBubbles(id, segments);
  replayLatestTurn();
}

function resolveCast(block: SpeechBlock, override: string): CastMember {
  if (override !== "auto") return cast.get(override) ?? cast.get("main")!;
  if (block.role === "narrator") return cast.get("narrator")!;
  if (block.speakerName) return cast.get(`character:${block.speakerName}`) ?? [...cast.values()].find((item) => item.characterName === block.speakerName) ?? cast.get("main")!;
  return cast.get("main")!;
}

function setupSpeechRecognition(): void {
  const SpeechRecognitionConstructor = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition
    ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
  const micButton = $("#mic-button") as HTMLButtonElement;
  if (!SpeechRecognitionConstructor) {
    micButton.hidden = true;
    return;
  }
  const recognition = new SpeechRecognitionConstructor();
  recognition.lang = "ja-JP";
  recognition.interimResults = true;
  recognition.onresult = (event) => {
    input.value = Array.from({ length: event.results.length }, (_, index) => event.results[index]?.[0]?.transcript ?? "").join("");
    resizeInput();
    syncDescriptionButton();
    recognitionActions.hidden = false;
  };
  recognition.onerror = (event) => showNotice(`音声を認識できません: ${event.error}`, true);
  recognition.onend = () => micButton.classList.remove("recording");
  micButton.addEventListener("click", async () => {
    await dramaPlayer.stop(true);
    recognition.start();
    micButton.classList.add("recording");
    showNotice("聴いています… 話しかけてください。");
  });
  $("#recognition-description").addEventListener("click", makeDescription);
}

function makeDescription(): void {
  const toggled = toggleDescriptionAtSelection(input.value, input.selectionStart, input.selectionEnd);
  input.value = toggled.value;
  recognitionActions.hidden = true;
  resizeInput();
  syncDescriptionButton();
  input.focus();
  input.setSelectionRange(toggled.selectionStart, toggled.selectionEnd);
}

function syncDescriptionButton(): void {
  const button = $("#description-button") as HTMLButtonElement;
  const start = input.value.lastIndexOf("\n", Math.max(0, input.selectionStart - 1)) + 1;
  const endIndex = input.value.indexOf("\n", input.selectionStart);
  const text = input.value.slice(start, endIndex < 0 ? input.value.length : endIndex).trim();
  button.classList.toggle("active", text.length >= 2 && text.startsWith("*") && text.endsWith("*"));
}

async function readSse(stream: ReadableStream<Uint8Array>, onData: (data: Record<string, unknown>) => void): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";
    for (const raw of events) {
      const eventName = raw.split("\n").find((line) => line.startsWith("event:"))?.slice(6).trim();
      const dataText = raw.split("\n").filter((line) => line.startsWith("data:")) .map((line) => line.slice(5).trimStart()).join("\n");
      if (eventName === "error") throw new Error((JSON.parse(dataText) as { error?: string }).error ?? "Stream error");
      if (dataText && eventName !== "done") onData(JSON.parse(dataText) as Record<string, unknown>);
    }
    if (done) break;
  }
}

function setPlayerState(state: "idle" | "preparing" | "playing", label: string, speaker: string): void {
  playStatus.textContent = label;
  player.dataset.speaker = speaker;
  speakerInitial.textContent = speaker.slice(0, 1).toUpperCase();
  player.classList.toggle("is-playing", state === "playing");
}

function showNotice(message: string, error = false): void {
  notice.textContent = message;
  notice.classList.toggle("error", error);
}

function resizeInput(): void { input.style.height = "auto"; input.style.height = `${Math.min(input.scrollHeight, 130)}px`; }
function delay(ms: number): Promise<void> { return new Promise((resolve) => setTimeout(resolve, ms)); }
function errorMessage(error: unknown): string { return error instanceof Error ? error.message : String(error); }
function isAbortError(error: unknown): boolean { return error instanceof DOMException ? error.name === "AbortError" : /aborted|aborterror/i.test(errorMessage(error)); }
function mediaError(audio: HTMLAudioElement): Error { const error = new Error(audio.error?.message || `音声リソースを読み込めませんでした (code: ${audio.error?.code ?? "unknown"})`); error.name = "MediaError"; return error; }
async function responseError(response: Response): Promise<string> { const data = await response.json().catch(() => ({})) as { error?: string }; return data.error ?? `Request failed (${response.status})`; }
async function fetchJson<T>(url: string): Promise<T> { const response = await fetch(url); if (!response.ok) throw new Error(await responseError(response)); return await response.json() as T; }
async function requestJson<T>(url: string, init: RequestInit): Promise<T> { const response = await fetch(url, init); if (!response.ok) throw new Error(await responseError(response)); return await response.json() as T; }
function characterImage(name: string | undefined): string | undefined { return (name ? characters.find((character) => character.name === name) : characters[0])?.imageUrl; }
function escapeHtml(value: string): string { const element = document.createElement("span"); element.textContent = value; return element.innerHTML; }
function option(value: string, label: string): HTMLOptionElement { const item = document.createElement("option"); item.value = value; item.textContent = label; return item; }
function labeledSelect(label: string, select: HTMLSelectElement): HTMLLabelElement { const wrapper = document.createElement("label"); wrapper.appendChild(document.createTextNode(label)); wrapper.appendChild(select); return wrapper; }
function semanticSelect(entries: Array<[string, string]>, current: number, onChange: (value: number) => void): HTMLSelectElement { const select = document.createElement("select"); for (const [value, label] of entries) select.appendChild(option(value, label)); select.value = String(entries.toSorted((a, b) => Math.abs(Number(a[0]) - current) - Math.abs(Number(b[0]) - current))[0]?.[0]); select.addEventListener("change", () => onChange(Number(select.value))); return select; }
function safeParseCast(value: string): Map<string, CastMember> { try { return new Map(JSON.parse(value) as Array<[string, CastMember]>); } catch { return new Map(); } }

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<{ 0?: { transcript?: string } }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
};
