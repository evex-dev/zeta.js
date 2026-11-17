import type { BaseClient } from "./core/client.ts";
import { ApiError, type RequestOptions } from "./core/types.ts";
import type { SnapshotResult } from "./snapshot.ts";

export type FeedPostBlock =
  | { type: "TEXT"; text: string }
  | { type: "PLOT"; plotId: string }
  | { type: "IMAGE"; imageId: string }
  | { type: "IMAGE"; fileKey: string }
  | { type: "POLL"; pollId: string }
  | { type: "POLL"; question: string; options: Array<{ text: string; imageFileKey?: string }>; durationMinutes: number };

export type FeedPostInput = {
  blocks: FeedPostBlock[];
  commentEnabled: boolean;
  files?: Record<string, Blob>;
};

/** Matches buildFeedPostBlocks/useFeedPostSubmit from the saved Android client. */
export function createFeedPostForm(input: FeedPostInput): FormData {
  const form = new FormData();
  form.set("blocks", JSON.stringify(input.blocks));
  form.set("commentEnabled", String(input.commentEnabled));
  for (const [key, file] of Object.entries(input.files ?? {})) {
    if (key === "blocks" || key === "commentEnabled") {
      throw new ApiError(`Reserved feed attachment key: ${key}`, { code: "InvalidFeedAttachment" });
    }
    form.append(key, file);
  }
  return form;
}

export class FeedApi {
  constructor(private readonly client: BaseClient) {}

  create(input: FeedPostInput, options: Pick<RequestOptions, "signal"> = {}): SnapshotResult<"createFeedPost"> {
    return this.client.api.createFeedPost({ ...options, body: createFeedPostForm(input) });
  }

  update(postId: string, input: FeedPostInput, options: Pick<RequestOptions, "signal"> = {}): SnapshotResult<"updateFeedPost"> {
    return this.client.api.updateFeedPost({ ...options, path: { postId }, body: createFeedPostForm(input) });
  }
}
