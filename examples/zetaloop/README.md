# zetaloop

Two Zeta plots talking to each other through the API.

`init` takes one search query for plot A and one for plot B, selects the first matching plot that has exactly one character from each query's result set, and writes them to `data/state.json`.
If the previous state has zetaloop chat profiles, `init` deletes those profiles before writing the new state. It does not delete previous rooms.
`loop` creates one room per plot, creates one Zeta user chat profile per room, and uses the opposite plot's character name as that room's user profile name. It sends plot A's output into plot B, then feeds B's output back into A for the next turn. The CLI redraws both room transcripts side by side while responses stream.
When resuming from an existing state, the UI fetches room messages from the Zeta API and starts with only the latest input/output pair per plot. During the current loop run, new input/output entries are added to the visible panes as they happen. `data/state.json` keeps plot, room, and chat profile IDs, not transcripts.

## Setup

Create `data/zeta.json`:

```json
{
  "token": "...",
  "refresh_token": "...",
  "device_id": "..."
}
```

Install dependencies:

```bash
bun install
```

## Run

Pick two single-character plots from separate queries:

```bash
bun run init -- --query-a "日常" --query-b "ファンタジー"
```

Each query inspects up to 20 results by default. If no matching plot is found, rerun with a different query or a larger limit:

```bash
bun run init -- --query-a "幼馴染" --query-b "魔法使い" --limit 40
```

Pick explicit plots instead:

```bash
bun run init -- --plot-a PLOT_ID_A --plot-b PLOT_ID_B
```

Run the loop:

```bash
bun run loop -- --turns 4 --seed "短く自己紹介して、相手に質問してください。"
```

If `--seed` is omitted, `loop` chooses the first input automatically:

- right after `init`: if either room has an intro, that intro is sent to the other plot
- when resuming: the latest counterpart response is sent back into the next plot
- fallback: a short default prompt is sent to plot A

Useful environment variables:

- `ZETA_CREDENTIALS`: credential JSON path, default `data/zeta.json`
- `ZETALOOP_STATE`: state JSON path, default `data/state.json`
- `ZETALOOP_QUERY_A`: init search query for plot A
- `ZETALOOP_QUERY_B`: init search query for plot B
- `ZETALOOP_SEARCH_LIMIT`: candidates inspected per query, default `20`
- `ZETALOOP_TURNS`: loop turn count
- `ZETALOOP_SEED`: explicit initial message
- `NO_TTY=1`: print plain log output instead of redrawing the side-by-side panes
