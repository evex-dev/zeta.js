import { type AutocompleteInteraction } from "discord.js";
import type { ZetaClient } from "zeta.js";

export async function handleKeywordAutocomplete(interaction: AutocompleteInteraction, zeta: ZetaClient): Promise<void> {
  if (interaction.commandName !== "zeta" || interaction.options.getSubcommand(false) !== "plot") {
    await interaction.respond([]);
    return;
  }

  const focused = interaction.options.getFocused(true);
  if (focused.name !== "keyword") {
    await interaction.respond([]);
    return;
  }

  const input = String(focused.value ?? "");
  const suggestions = await suggestKeywords(input, zeta);
  await interaction.respond(toAutocompleteChoices(suggestions));
}

async function suggestKeywords(input: string, zeta: ZetaClient): Promise<string[]> {
  const trimmed = input.trim();
  if (!trimmed) {
    return await recommendedKeywords(zeta);
  }

  const spaced = parseSpacedKeywordInput(input);
  if (spaced) {
    const suggestions = spaced.current
      ? uniqueStrings([
        ...await autocompleteKeyword(spaced.current, zeta),
        ...await relatedThenRecommendedKeywords(trimmed, zeta),
      ])
      : await relatedThenRecommendedKeywords(spaced.query, zeta);
    return suggestions.map((suggestion) => `${spaced.prefix}${suggestion}`);
  }

  return await autocompleteKeyword(trimmed, zeta);
}

async function recommendedKeywords(zeta: ZetaClient): Promise<string[]> {
  const [placeholder, recommended] = await Promise.all([
    zeta.search.getRecommendedPlaceholder().then((result) => result.data.recommendedQueryList ?? []).catch(() => []),
    zeta.search.getRecommendedKeywords().then((result) => result.data.keywords ?? []).catch(() => []),
  ]);

  return uniqueStrings([...placeholder, ...recommended]);
}

async function autocompleteKeyword(keyword: string, zeta: ZetaClient): Promise<string[]> {
  const autocomplete = await zeta.search.autocompletePlots({ keyword, limit: 25 }).then((result) => [
    ...readAutocompleteStrings(result.data.autocomplete),
    ...readAutocompleteStrings(result.data.keywords),
    ...readAutocompleteHashtags(result.data.hashtags),
  ]).catch(() => []);

  return uniqueStrings(autocomplete);
}

async function relatedThenRecommendedKeywords(keyword: string, zeta: ZetaClient): Promise<string[]> {
  const [related, recommended] = await Promise.all([
    zeta.search.getRelatedKeywords({ keyword, limit: 10 }).then((result) => result.data.relatedKeywords ?? []).catch(() => []),
    zeta.search.getRecommendedKeywords({ keyword, limit: 10 }).then((result) => result.data.keywords ?? []).catch(() => []),
  ]);

  return uniqueStrings([...related, ...recommended]);
}

function parseSpacedKeywordInput(input: string): { prefix: string; query: string; current?: string } | undefined {
  if (!/\s/.test(input)) {
    return undefined;
  }

  const endsWithSpace = /\s$/.test(input);
  const parts = input.trim().split(/\s+/).filter(Boolean);
  const completed = endsWithSpace ? parts : parts.slice(0, -1);
  const query = completed.join(" ").trim();
  if (!query) {
    return undefined;
  }

  return {
    prefix: `${completed.join(" ")} `,
    query,
    current: endsWithSpace ? undefined : parts.at(-1),
  };
}

function readAutocompleteStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function readAutocompleteHashtags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (!item || typeof item !== "object") {
        return undefined;
      }

      const hashtag = (item as { hashtag?: unknown; name?: unknown; key?: unknown }).hashtag
        ?? (item as { hashtag?: unknown; name?: unknown; key?: unknown }).name
        ?? (item as { hashtag?: unknown; name?: unknown; key?: unknown }).key;
      return typeof hashtag === "string" ? hashtag : undefined;
    })
    .filter((item): item is string => Boolean(item?.trim()));
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const output: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    const key = trimmed.toLocaleLowerCase();
    if (!trimmed || seen.has(key)) {
      continue;
    }

    seen.add(key);
    output.push(trimmed);
  }
  return output;
}

function toAutocompleteChoices(values: string[]): Array<{ name: string; value: string }> {
  return values.slice(0, 25).map((value) => {
    const truncated = truncateAutocompleteValue(value);
    return { name: truncated, value: truncated };
  });
}

function truncateAutocompleteValue(value: string): string {
  return [...value].slice(0, 100).join("");
}
