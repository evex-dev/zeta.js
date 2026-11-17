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

test("ignores SSE heartbeat frames and preserves unfamiliar JSON events", async () => {
  const events = [];
  const input = ': heartbeat\r\n\r\nevent: ping\r\n\r\ndata: {"event":"FUTURE_EVENT","payload":42}\r\n\r\n';
  for await (const event of readEventStream(new Response(input))) events.push(event.data);
  expect(events).toEqual([{ event: "FUTURE_EVENT", payload: 42 }]);
});

test("cancels the underlying stream when a consumer stops early", async () => {
  let cancelled = false;
  const input = new ReadableStream({
    start(controller) { controller.enqueue(new TextEncoder().encode('data: {"n":1}\n\n')); },
    cancel() { cancelled = true; },
  });
  for await (const event of readEventStream(new Response(input))) { expect(event.data).toEqual({ n: 1 }); break; }
  expect(cancelled).toBe(true);
});
