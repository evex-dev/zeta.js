import type { Plot } from "../../../index.ts";
import { statePath, writeJsonFile } from "./config.ts";

export type ZetaloopPlot = {
  id: string;
  name: string;
  characterName: string;
  description?: string;
};

export type TranscriptEntry = {
  at: string;
  direction: "input" | "output";
  text: string;
};

export type ZetaloopState = {
  version: 1;
  plots: {
    a: ZetaloopPlot;
    b: ZetaloopPlot;
  };
  rooms?: {
    a?: string;
    b?: string;
  };
  chatProfiles?: {
    a?: string;
    b?: string;
  };
};

export async function readState(path = statePath): Promise<ZetaloopState> {
  const file = Bun.file(path);
  if (!(await file.exists())) {
    throw new Error(`Zetaloop state file not found: ${path}. Run "bun run init" first.`);
  }

  return await file.json() as ZetaloopState;
}

export async function writeState(state: ZetaloopState, path = statePath): Promise<void> {
  await writeJsonFile(path, state);
}

export function makeInitialState(a: ZetaloopPlot, b: ZetaloopPlot): ZetaloopState {
  return {
    version: 1,
    plots: { a, b },
  };
}

export function statePlotFromApi(plot: Plot, helpers: {
  id: string;
  name: string;
  characterName: string;
  description?: string;
}): ZetaloopPlot {
  return {
    id: helpers.id,
    name: helpers.name,
    characterName: helpers.characterName,
    description: helpers.description || undefined,
  };
}
