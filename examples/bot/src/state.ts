import { dirname } from "node:path";
import { mkdir, rename } from "node:fs/promises";
import type { BindingStoreData, ChannelBinding } from "./types.ts";

const DEFAULT_DATA: BindingStoreData = { bindings: {} };

export class BindingStore {
  private data: BindingStoreData = DEFAULT_DATA;

  constructor(private readonly filePath = "data/bindings.json") {}

  async load(): Promise<void> {
    const file = Bun.file(this.filePath);
    if (!(await file.exists())) {
      this.data = { bindings: {} };
      return;
    }

    const parsed = await file.json().catch(() => DEFAULT_DATA);
    this.data = normalizeStoreData(parsed);
  }

  get(channelId: string): ChannelBinding | undefined {
    return this.data.bindings[channelId];
  }

  list(): ChannelBinding[] {
    return Object.values(this.data.bindings);
  }

  async set(binding: Omit<ChannelBinding, "createdAt" | "updatedAt">): Promise<ChannelBinding> {
    const existingChannel = this.data.bindings[binding.channelId];
    const duplicate = this.list().find((item) => item.talkId === binding.talkId && item.channelId !== binding.channelId);
    if (duplicate) {
      throw new Error(`トーク ${binding.talkId} はすでにチャンネル ${duplicate.channelId} に紐付けられています.`);
    }

    const now = new Date().toISOString();
    const next: ChannelBinding = {
      ...binding,
      createdAt: existingChannel?.createdAt ?? now,
      updatedAt: now,
    };
    this.data.bindings[binding.channelId] = next;
    await this.save();
    return next;
  }

  async update(channelId: string, patch: Partial<Pick<ChannelBinding, "webhookId" | "plotName" | "avatarUrl" | "speakerProfiles">>): Promise<void> {
    const existing = this.data.bindings[channelId];
    if (!existing) {
      return;
    }

    this.data.bindings[channelId] = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await this.save();
  }

  async unlink(channelId: string): Promise<ChannelBinding | undefined> {
    const existing = this.data.bindings[channelId];
    if (!existing) {
      return undefined;
    }

    delete this.data.bindings[channelId];
    await this.save();
    return existing;
  }

  private async save(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.tmp`;
    await Bun.write(tempPath, `${JSON.stringify(this.data, null, 2)}\n`);
    await rename(tempPath, this.filePath);
  }
}

function normalizeStoreData(value: unknown): BindingStoreData {
  if (!value || typeof value !== "object") {
    return { bindings: {} };
  }

  const bindings = (value as Partial<BindingStoreData>).bindings;
  if (!bindings || typeof bindings !== "object") {
    return { bindings: {} };
  }

  return { bindings: bindings as Record<string, ChannelBinding> };
}
