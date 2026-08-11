import { describe, expect, test } from "bun:test";
import { BaseClient } from "./core/client.ts";

describe("CoinApi", () => {
  test("claims daily rewards until attempts are exhausted", async () => {
    const calls: Array<{ url: string; body?: BodyInit | null }> = [];
    const rewards = [
      { success: true, amount: 1 },
      { success: true, amount: 1 },
    ];
    const client = new BaseClient({
      baseUrl: "https://example.test",
      token: "access",
      fetch: async (url, init) => {
        calls.push({ url: String(url), body: init?.body });
        const requestUrl = String(url);
        if (requestUrl.endsWith("/v1/coin/daily-rewards/left-attempts")) {
          return jsonResponse(calls.filter((call) => call.url.endsWith("/left-attempts")).length === 1
            ? { leftAttempts: 2 }
            : { leftAttempts: 0 });
        }
        if (requestUrl.endsWith("/v1/coin/daily-rewards")) {
          expect(init?.body).toBe(JSON.stringify({}));
          return jsonResponse(rewards.shift());
        }
        if (requestUrl.endsWith("/v1/coin/balance")) {
          return jsonResponse({ balance: 12 });
        }
        return jsonResponse({});
      },
    });

    const summary = await client.coin.claimDailyRewards();

    expect(summary).toEqual({
      leftAttemptsBefore: 2,
      claimed: 2,
      attempts: [
        { index: 0, reward: { success: true, amount: 1 } },
        { index: 1, reward: { success: true, amount: 1 } },
      ],
      balance: { balance: 12 },
      leftAttemptsAfter: 0,
    });
    expect(calls.map((call) => call.url)).toEqual([
      "https://example.test/v1/coin/daily-rewards/left-attempts",
      "https://example.test/v1/coin/daily-rewards",
      "https://example.test/v1/coin/daily-rewards",
      "https://example.test/v1/coin/balance",
      "https://example.test/v1/coin/daily-rewards/left-attempts",
    ]);
  });

  test("stops daily reward claims when API reports success false", async () => {
    let rewardCalls = 0;
    const client = new BaseClient({
      baseUrl: "https://example.test",
      token: "access",
      fetch: async (url) => {
        const requestUrl = String(url);
        if (requestUrl.endsWith("/v1/coin/daily-rewards/left-attempts")) {
          return jsonResponse({ leftAttempts: rewardCalls === 0 ? 3 : 2 });
        }
        if (requestUrl.endsWith("/v1/coin/daily-rewards")) {
          rewardCalls += 1;
          return jsonResponse({ success: false });
        }
        if (requestUrl.endsWith("/v1/coin/balance")) {
          return jsonResponse({ balance: 3 });
        }
        return jsonResponse({});
      },
    });

    const summary = await client.coin.claimDailyRewards();

    expect(rewardCalls).toBe(1);
    expect(summary.claimed).toBe(0);
    expect(summary.attempts).toEqual([{ index: 0, reward: { success: false } }]);
    expect(summary.leftAttemptsAfter).toBe(2);
  });
});

function jsonResponse(data: unknown, headers: HeadersInit = {}, status = 200): Response {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Content-Type", "application/json");
  return new Response(JSON.stringify(data), { status, headers: responseHeaders });
}
