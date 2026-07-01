import { describe, expect, test } from "bun:test";
import { readEventStream } from "./stream.ts";

describe("readEventStream", () => {
  test("parses SSE-like chunks as async events", async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("event: message\ndata: {\"a\":"));
        controller.enqueue(new TextEncoder().encode("1}\n\nid: 2\ndata: text\n\n"));
        controller.close();
      },
    });

    const events = [];
    for await (const event of readEventStream(new Response(stream))) {
      events.push(event);
    }

    expect(events).toMatchObject([
      { event: "message", data: { a: 1 } },
      { id: "2", data: "text" },
    ]);
  });
});
