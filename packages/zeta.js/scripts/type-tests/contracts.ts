import type { ChatStreamEvent, MessageContent, SnapshotDto, ZetaClient } from "../../index.ts";

// This file is compiled, never executed. Negative cases protect the public
// interface against the permissive Record<string, unknown> unions it replaces.
function consumer(client: ZetaClient, event: ChatStreamEvent) {
  client.api.getRoom({ path: { roomId: "room" } });
  client.api.listPlugin();
  client.api.chat({ path: { roomId: "room" }, body: { type: "TEXT", text: "hello" } });
  client.api.extractTagsFromImage({ body: new FormData() });
  client.api.validateNiceAdditionalAuth({ query: { request_id: "r", web_transaction_id: "w" } });
  client.feed.create({ blocks: [{ type: "TEXT", text: "hello" }], commentEnabled: true });

  // @ts-expect-error Room path parameters are required.
  client.api.getRoom();
  // @ts-expect-error Incorrect path parameter names must not compile.
  client.api.getRoom({ path: { id: "room" } });
  // @ts-expect-error GET requests do not accept JSON bodies.
  client.api.listPlugin({ body: { bad: true } });
  // @ts-expect-error TEXT messages require text.
  client.api.chat({ path: { roomId: "room" }, body: { type: "TEXT" } });
  // @ts-expect-error An arbitrary object must not bypass the message discriminator.
  client.api.chat({ path: { roomId: "room" }, body: { type: "INVENTED" } });
  // @ts-expect-error A multipart endpoint requires FormData.
  client.api.extractTagsFromImage({ body: { image: "url" } });
  // @ts-expect-error The validation query is required.
  client.api.validateNiceAdditionalAuth();
  // @ts-expect-error A text content requires the TEXT discriminator.
  const badContent: MessageContent = { text: "hello" };
  void badContent;

  if (event.event === "CHAT_COMPLETE") {
    const message = event.replyMessage;
    message.contents?.forEach((content) => {
      if (content.type === "TEXT") content.text.trim();
      if (content.type === "INFO_BOX") content.characters.map((character) => character.items);
      if (content.type === "PLUGIN") JSON.stringify(content.data);
    });
  }
  if (event.event === "CYOA" && event.data.status === "COMPLETE") {
    event.data.choices.map((choice) => choice.text.toUpperCase());
  }
  if (event.event === "AUTO_PAYMENT_REQUESTED") event.orderId.toUpperCase();
}

function recoveredTypes(dto: SnapshotDto<"MessageApiDtoTextApiDto">) {
  const discriminator: "TEXT" = dto.type;
  // @ts-expect-error Missing primitive types must remain unknown, never become any.
  const text: string = dto.text;
  return { discriminator, text };
}

void consumer;
void recoveredTypes;
