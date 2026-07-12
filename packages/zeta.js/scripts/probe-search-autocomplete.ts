import { ApiError, createZetaClient, type PlotSearchQuery } from "../index.ts";

const client = createZetaClient({ userLanguage: "JAPANESE" });

const cases: Array<{ name: string; query?: PlotSearchQuery }> = [
  { name: "empty" },
  { name: "partial", query: { keyword: "恋", limit: 10 } },
  { name: "complete", query: { keyword: "恋愛", limit: 10 } },
];

for (const testCase of cases) {
  console.log(JSON.stringify({ case: testCase.name, query: testCase.query ?? null }));

  await run("autocompletePlots", () => client.search.autocompletePlots(testCase.query));
  await run("getRecommendedPlaceholder", () => client.search.getRecommendedPlaceholder());
  await run("getRecommendedKeywords", () => client.search.getRecommendedKeywords(testCase.query));
  await run("getRelatedKeywords", () => client.search.getRelatedKeywords(testCase.query));
}

async function run(name: string, task: () => Promise<{ data: unknown }>): Promise<void> {
  const started = performance.now();
  try {
    const result = await task();
    console.log(JSON.stringify({
      ok: true,
      name,
      ms: Math.round(performance.now() - started),
      shape: shapeOf(result.data),
      sample: sample(result.data),
    }));
  } catch (error) {
    console.log(JSON.stringify({
      ok: false,
      name,
      ms: Math.round(performance.now() - started),
      ...describeError(error),
    }));
  }
}

function shapeOf(value: unknown): string {
  if (Array.isArray(value)) {
    return `array(${value.length})`;
  }

  if (value && typeof value === "object") {
    return `object(${Object.keys(value).join(",")})`;
  }

  return typeof value;
}

function sample(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 5).map(sample);
  }

  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (Array.isArray(item)) {
      output[key] = item.slice(0, 5).map(sample);
      continue;
    }

    if (item && typeof item === "object") {
      const object = item as Record<string, unknown>;
      output[key] = Object.fromEntries(Object.entries(object).slice(0, 8));
      continue;
    }

    output[key] = item;
  }
  return output;
}

function describeError(error: unknown): Record<string, unknown> {
  if (error instanceof ApiError) {
    return {
      status: error.status,
      code: error.code,
      message: error.message,
      shape: shapeOf(error.data),
    };
  }

  if (error instanceof Error) {
    return { errorName: error.name, message: error.message };
  }

  return { message: String(error) };
}
