import type { Plot, ZetaClient } from "../../../index.ts";
import { createConfiguredZetaClient, statePath } from "./config.ts";
import { makeInitialState, readState, statePlotFromApi, writeState } from "./state.ts";
import { hasExactlyOneCharacter, plotDescription, plotIdOf, plotName, singleCharacterName, truncate } from "./text.ts";

type InitOptions = {
  plotA?: string;
  plotB?: string;
  queryA?: string;
  queryB?: string;
  limit: number;
};

const rawArgs = Bun.argv.slice(2);
if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
  printHelp();
  process.exit(0);
}

const options = parseArgs(rawArgs);
const queryA = options.plotA ? undefined : requiredQuery(options.queryA, "A");
const queryB = options.plotB ? undefined : requiredQuery(options.queryB, "B");
const zeta = await createConfiguredZetaClient();
const plotA = options.plotA
  ? await loadSingleCharacterPlot(zeta, options.plotA)
  : await findSingleCharacterPlot(zeta, "A", queryA!, options.limit);
const plotB = options.plotB
  ? await loadSingleCharacterPlot(zeta, options.plotB)
  : await findSingleCharacterPlot(zeta, "B", queryB!, options.limit, new Set([plotIdOf(plotA)].filter((id): id is string => Boolean(id))));

await deletePreviousChatProfiles(zeta);
const state = makeInitialState(toStatePlot(plotA), toStatePlot(plotB));
await writeState(state);

console.log(`Wrote ${statePath}`);
console.log(`A: ${state.plots.a.name} (${state.plots.a.characterName}) ${state.plots.a.id}`);
console.log(`B: ${state.plots.b.name} (${state.plots.b.characterName}) ${state.plots.b.id}`);

async function findSingleCharacterPlot(client: ZetaClient, side: "A" | "B", query: string, limit: number, excludedIds = new Set<string>()): Promise<Plot> {
  const seen = new Set<string>();

  const candidates = await listCandidates(client, query, limit);
  for (const candidate of candidates) {
    const id = plotIdOf(candidate);
    if (!id || seen.has(id) || excludedIds.has(id)) {
      continue;
    }
    seen.add(id);

    const hydrated = await hydratePlot(client, candidate);
    if (!hasExactlyOneCharacter(hydrated)) {
      continue;
    }

    console.log(`${side}: selected ${plotName(hydrated)} (${singleCharacterName(hydrated)}) from query "${query}"`);
    return hydrated;
  }

  throw new Error(`No single-character plot found for ${side} query "${query}" in the first ${limit} results. Try a different query.`);
}

async function listCandidates(client: ZetaClient, query: string, limit: number): Promise<Plot[]> {
  const result = await client.search.searchPlots({ keyword: query, limit });
  return result.data.plots ?? [];
}

async function loadSingleCharacterPlot(client: ZetaClient, plotId: string): Promise<Plot> {
  const plot = await client.plots.get(plotId).then((resource) => resource.data);
  if (!plot) {
    throw new Error(`Plot not found: ${plotId}`);
  }
  if (!hasExactlyOneCharacter(plot)) {
    throw new Error(`Plot is not single-character: ${plotName(plot)} (${plotId})`);
  }
  return plot;
}

async function hydratePlot(client: ZetaClient, plot: Plot): Promise<Plot> {
  const id = plotIdOf(plot);
  if (!id) {
    return plot;
  }
  return await client.plots.get(id).then((resource) => resource.data ?? plot).catch(() => plot);
}

async function deletePreviousChatProfiles(client: ZetaClient): Promise<void> {
  const previous = await readState().catch(() => undefined);
  const profileIds = [
    previous?.chatProfiles?.a,
    previous?.chatProfiles?.b,
  ].filter((id): id is string => Boolean(id));

  for (const id of new Set(profileIds)) {
    await client.profile.chatProfiles
      .fromId(id)
      .delete()
      .then(() => console.log(`Deleted previous chat profile: ${id}`))
      .catch((error) => {
        console.warn(`Failed to delete previous chat profile ${id}: ${describeError(error)}`);
      });
  }
}

function toStatePlot(plot: Plot) {
  const id = plotIdOf(plot);
  if (!id) {
    throw new Error(`Selected plot has no id: ${JSON.stringify(plot)}`);
  }

  return statePlotFromApi(plot, {
    id,
    name: truncate(plotName(plot), 80),
    characterName: truncate(singleCharacterName(plot), 80),
    description: truncate(plotDescription(plot), 200),
  });
}

function parseArgs(args: string[]): InitOptions {
  const options: InitOptions = {
    limit: numberFromEnv(Bun.env.ZETALOOP_SEARCH_LIMIT, 20),
    queryA: Bun.env.ZETALOOP_QUERY_A,
    queryB: Bun.env.ZETALOOP_QUERY_B,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];
    if (arg === "--plot-a" && next) {
      options.plotA = next;
      index += 1;
    } else if (arg === "--plot-b" && next) {
      options.plotB = next;
      index += 1;
    } else if ((arg === "--query-a" || arg === "--a") && next) {
      options.queryA = next;
      index += 1;
    } else if ((arg === "--query-b" || arg === "--b") && next) {
      options.queryB = next;
      index += 1;
    } else if (arg === "--limit" && next) {
      options.limit = numberFromEnv(next, options.limit);
      index += 1;
    }
  }

  return options;
}

function requiredQuery(value: string | undefined, side: "A" | "B"): string {
  const query = value?.trim();
  if (!query) {
    throw new Error(`Missing query for ${side}. Pass --query-${side.toLowerCase()} "keyword", or use --plot-a/--plot-b for explicit plot ids.`);
  }
  return query;
}

function numberFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function printHelp(): void {
  console.log(`Usage:
  bun run init -- --query-a "日常" --query-b "ファンタジー"
  bun run init -- --plot-a PLOT_ID_A --plot-b PLOT_ID_B

Options:
  --query-a, --a  Search query used to pick plot A
  --query-b, --b  Search query used to pick plot B
  --limit         Number of candidates to inspect per query, default 20
  --plot-a        Explicit plot id for side A
  --plot-b        Explicit plot id for side B

Environment:
  ZETALOOP_QUERY_A
  ZETALOOP_QUERY_B
  ZETALOOP_SEARCH_LIMIT
`);
}
