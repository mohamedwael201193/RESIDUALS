# RESIDUALS — MEMORY.md
> Persistent progress log. Update after every completed block so context loss does not erase state.

## Goal
Ship RESIDUALS (OKX.AI A2MCP) for Creative Genius 1st place. Real infra, no mocks. Planhat-style Vite frontend. Deadline Jul 27 23:59 UTC; listing review ≤24h.

## Wallets (CRITICAL — do not confuse)
| Role | Address | Notes |
|------|---------|-------|
| **OPERATOR** (`OPERATOR_PRIVATE_KEY`) | `0xf76e6B0920e9332fF4410f6dD53F01722AbC71a3` | Funded EOA: OKB gas + USD₮0 for vault credits + paid e2e buyer |
| **PAY_TO** (OKX Agentic fee receiver) | `0x94a18c39ac86b3a50f443db5083ec4132ab5e4f2` | x402 `payTo` — user's OKX account address. Keep as-is. |
| **Vault** | `0x068bB96e849F0DE3D49944Ec0F4aEd3D6B165770` | ResidualsVault on X Layer 196 |
| **USDT0** | `0x779Ded0c9e1022225f8E0630b35a9b54bE713736` | 6 decimals, EIP-712 name `USD₮0` v1 |

## Env status (2026-07-25 ~21:00 UTC)
- OKX API key/secret/passphrase: SET
- OPERATOR + PAY_TO + vault: SET (see table)
- DATABASE_URL (+ DIRECT session pooler): SET, migrations applied
- Embeddings: **gemini-embedding-001** + `outputDimensionality=768`
- LLM cascade / ADMIN_TOKEN / CRON_SECRET: SET
- PUBLIC_BASE_URL: still `http://localhost:3000` in `.env` (set to always-on HTTPS after Render/Fly)
- AGENT_ID / RENDER_API_KEY / VERCEL_TOKEN: EMPTY
- Avatar file: `docs/avatar.png` (+ `apps/web/public/listing/avatar.png`) ≤1MB

## On-chain X Layer 196 — VERIFIED
- Deploy: `0xe5c76d4c8d4b86875e7dcd85202949ffe46abbfd9a2e8f9bef51edfa55d22f85`
- Explorer: https://www.okx.com/web3/explorer/xlayer/address/0x068bB96e849F0DE3D49944Ec0F4aEd3D6B165770
- Smoke PASS:
  - approve `0xed2a81563034f0a6e37e1ccd1de30259b2a1a0fc4422f9f9e258591936383f46`
  - credit `0x62bee7d83d59accfbb74b7a9959d29f4085a41d2ed8ab3b4eaa9e6c184113565`
  - withdraw `0x5fb965b559d4debb99fedcb85c272d2e982662777091c949eaa6c2db3534f67c`
- Paid x402 settles (operator → PAY_TO, 0.03 USDT0 each):
  - `0xfe8e7d5ebf7b6de864c09a21ea765d79047d2d401410e27b8f41cc1ba88238dc` (queryId 4; payer was null — pre-fix)
  - `0x6ed065545893898f2c62bb84d7d8adb6069cb0f4d7301b234dca14182b5c6289` (queryId 5; **payer recorded**)

## Local + public probe results
| Check | Result |
|-------|--------|
| Unit tests shared | 3/3 pass |
| Unit tests api | **7/7 pass** (antifarm, env, extractPayer) |
| Foundry vault | **4/4 pass** |
| `GET /health` | 200, db+embed green, vault address present |
| `GET/POST /sample` | 200 real retrieval |
| `GET/POST /ask` unpaid | **402 + PAYMENT-REQUIRED** |
| `POST /contribute` | 200 (entry id 90) |
| `GET /ledger` | 200 |
| `GET /contributor/:addr` | 200 + vault |
| `POST /internal/sweep` | 200 `{credited:0}` (no pending accruals yet) |
| Paid `/ask` settle | **200 charged**, ~6s latency |
| Web production build | OK (`apps/web/dist`) |
| API typecheck/build | OK |
| Cloudflare quick tunnel HTTPS probe | health/sample/ask/ledger OK |
| Tunnel URL (ephemeral, NOT for ASP) | `https://stephanie-capabilities-west-joint.trycloudflare.com` |

## Bugs fixed this session
1. PowerShell: quote `0x…` addresses (`$OP='0xf76e…'`).
2. `extractPayer` read `PAYMENT-SIGNATURE.authorization.from` (express middleware never sets `req.locals`).
3. `app.set('trust proxy', 1)` so x402 resource URL is `https://` behind proxies.
4. Paid client: use `registerExactEvmScheme` with `privateKeyToAccount` — `toClientEvmSigner` yields `address=undefined` on current viem.
5. API `start` script no longer requires baked `.env` (host injects secrets).

## Architecture decisions
- Embedding dim 768; money = integer micros; dual GET+POST `/ask`+`/sample`
- Planhat Vite frontend + reeded-glass hero
- Deploy scaffolds: `Dockerfile`, `fly.toml`, `render.yaml`, `apps/web/vercel.json`
- Script: `npm run e2e:paid-ask -w @residuals/api`

## Progress checklist
- [x] Monorepo + migrations + seed (89 entries / 11 contributors)
- [x] Vault deploy + approve/credit/withdraw smoke
- [x] Full local e2e routes
- [x] Real mainnet paid x402 settle
- [x] Payer extraction + trust proxy
- [x] Listing copy + avatar file
- [ ] **Always-on host** (Render paid / Fly) → set `PUBLIC_BASE_URL` — needs account login/token
- [ ] Vercel web deploy — needs `VERCEL_TOKEN` or `vercel login`
- [ ] ASP listing via Onchain OS → `AGENT_ID`
- [ ] Cron sweep on prod every 10m
- [ ] Royalty accrual e2e (needs ≥2 distinct payers per antifarm rule) + sweep credit
- [ ] Demo / X / #OKXAI / Google form
- [ ] ≥10 external real contributors

## Blocked on human (cannot finish alone)
1. **Always-on host auth** — `flyctl` installed at `%USERPROFILE%\.fly\bin\flyctl.exe` but headless shell cannot `auth login`. Set one of:
   - `FLY_API_TOKEN` (from https://fly.io/user/personal_access_tokens), then agent can `fly launch` / deploy
   - or `RENDER_API_KEY` / Vercel token
   - or you deploy via dashboard using `Dockerfile` / `render.yaml`
2. **Onchain OS ASP UI** — submit listing with always-on HTTPS endpoint + `docs/avatar.png`.
3. **Second payer wallet** (optional) for antifarm `distinct_payers >= 2` so royalties accrue + sweep credits vault.
4. External contributor recruitment + demo recording.

**Do not** use the ephemeral trycloudflare URL for ASP listing (no uptime guarantee / bot challenges).

## Commands
```powershell
cd d:\route\okx\residuals
Remove-Item Env:EMBEDDINGS_MODEL -ErrorAction SilentlyContinue
npm run dev -w @residuals/api
npm run e2e:paid-ask -w @residuals/api
npm test
$env:PATH = "$env:USERPROFILE\.foundry\bin;$env:USERPROFILE\.local\bin;$env:PATH"
cloudflared tunnel --url http://127.0.0.1:3000
# Quote hex addresses in PowerShell:
$OP='0xf76e6B0920e9332fF4410f6dD53F01722AbC71a3'
```

## Last update
2026-07-25 ~21:00 UTC — operator=0xf76e… / PAY_TO=OKX 0x94a1… confirmed; vault smoke + paid settle PASS; payer fix + trust proxy; HTTPS tunnel probes green; waiting on always-on host credentials for ASP listing.

2026-07-25 ~20:58 UTC (loop tick) — API still green locally; restarted so `/health` reloads `RESIDUALS_VAULT_ADDRESS`. Still blocked: no `FLY_API_TOKEN` / Render / Vercel credentials for always-on deploy.

<!-- ship-checkpoint 01 -->

<!-- ship-checkpoint 02 -->

<!-- ship-checkpoint 03 -->

<!-- ship-checkpoint 04 -->

<!-- ship-checkpoint 05 -->

<!-- ship-checkpoint 06 -->

<!-- ship-checkpoint 07 -->

<!-- ship-checkpoint 08 -->

<!-- ship-checkpoint 09 -->

<!-- ship-checkpoint 10 -->

<!-- ship-checkpoint 11 -->

<!-- ship-checkpoint 12 -->

<!-- ship-checkpoint 13 -->

<!-- ship-checkpoint 14 -->

<!-- ship-checkpoint 15 -->
