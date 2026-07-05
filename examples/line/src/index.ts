import { validateSignature } from "@line/bot-sdk";
import { Hono } from "hono";
import type {
  LineWebhookPayload,
  ProcessPayload,
  ZetaCredentialInput,
} from "./types.ts";
export { ZetaState } from "./zeta-state.ts";

const STATE_OBJECT_NAME = "line-zeta-state";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", (c) => c.text("LINE Zeta bot is running."));

app.post("/webhook", async (c) => {
  const body = await c.req.text();
  const signature = c.req.header("x-line-signature");

  if (!signature || !validateSignature(body, c.env.CHANNEL_SECRET, signature)) {
    return c.text("Invalid signature", 401);
  }

  const payload = JSON.parse(body) as LineWebhookPayload;
  const stub = c.env.ZETA_STATE.get(
    c.env.ZETA_STATE.idFromName(STATE_OBJECT_NAME),
  );
  const task = stub
    .fetch("https://line-zeta-state/process", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ payload } satisfies ProcessPayload),
    })
    .then(async (response) => {
      if (!response.ok) {
        console.error(
          "LINE webhook processing failed",
          response.status,
          await response.text(),
        );
      }
    })
    .catch((error) => {
      console.error("LINE webhook processing failed", describeError(error));
    });

  c.executionCtx.waitUntil(task);
  return c.json({});
});

app.post("/admin/zeta-cred", async (c) => {
  if (!c.env.ZETA_INIT_SECRET) {
    return c.text("Not found", 404);
  }

  if (c.req.header("x-admin-secret") !== c.env.ZETA_INIT_SECRET) {
    return c.text("Unauthorized", 401);
  }

  const credential = await c.req.json<ZetaCredentialInput>();
  const stub = c.env.ZETA_STATE.get(
    c.env.ZETA_STATE.idFromName(STATE_OBJECT_NAME),
  );
  const response = await stub.fetch("https://line-zeta-state/zeta-cred", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(credential),
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "content-type":
        response.headers.get("content-type") ?? "application/json",
    },
  });
});

function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return { message: String(error) };
}

export default app;
