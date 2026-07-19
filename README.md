# RESIDUALS

OKX.AI A2MCP agent: answers practical questions from a human-contributed corpus and pays USD₮0 royalties to contributors whose entries were retrieved.

See parent docs:

- `../WINNING_IDEA.md`
- `../FINAL_PROMPT.md`
- `../MISSING_SECRETS.md`

## Setup

1. Copy `.env.example` → `.env` (a filled `.env` may already exist locally; it is gitignored).
2. Fill every **REQUIRED FROM YOU** field (see chat / `../MISSING_SECRETS.md`).
3. In Supabase SQL editor, run: `CREATE EXTENSION IF NOT EXISTS vector;`
4. Do not begin coding phases until OKX passphrase + operator wallet + PAY_TO are set.

## Layout

```
apps/api      — ASP (Express + x402)
apps/web      — React + Vite UI
packages/shared
contracts/    — ResidualsVault (Foundry)
docs/
```
