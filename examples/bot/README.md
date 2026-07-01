# zeta-chan

Discord bridge for Zeta Talks.

## Setup

Create `bot/.env` with:

```bash
DISCORD_TOKEN=...
```

Keep Zeta credentials in `data/zeta.json`. Refreshed Zeta access/refresh tokens are written back to that file automatically.

In the Discord Developer Portal, enable the Message Content intent for the bot application. The bot registers the global `/zeta` command on startup.

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run start
```
