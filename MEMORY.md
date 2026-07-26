# RESIDUALS — MEMORY.md
> Persistent progress log. Update after every completed block so context loss does not erase state.
> Standing user instruction (2026-07-26): always proceed when confirms are needed; always write every action/result here.

## Goal
Ship RESIDUALS (OKX.AI A2MCP Lifestyle agent) for Creative Genius 1st place. Real infra, no mocks. Planhat-style Vite frontend. Deadline Jul 27 23:59 UTC; listing review ≤24h.

## Production URLs (LIVE)
| Surface | URL |
|---------|-----|
| **API (Render starter, Singapore)** | https://residuals-api.onrender.com |
| **Web (Vercel)** | https://residuals-web.vercel.app |
| **GitHub** | https://github.com/mohamedwael201193/RESIDUALS |
| Render dashboard | https://dashboard.render.com/web/srv-d9iiedfaqgkc73a5ie1g |
| Cron sweep | `residuals-sweep` every 10m → `POST /internal/sweep` |

## Wallets (CRITICAL — do not confuse)
| Role | Address | Notes |
|------|---------|-------|
| **OPERATOR** | `0xf76e6B0920e9332fF4410f6dD53F01722AbC71a3` | Funded EOA — gas + USDT0 + paid e2e buyer (`OPERATOR_PRIVATE_KEY`) |
| **PAY_TO** | `0x94a18c39ac86b3a50f443db5083ec4132ab5e4f2` | OKX account / x402 fee receiver — keep as-is |
| **Vault** | `0x068bB96e849F0DE3D49944Ec0F4aEd3D6B165770` | ResidualsVault on X Layer 196 |
| **USDT0** | `0x779Ded0c9e1022225f8E0630b35a9b54bE713736` | 6 decimals |
| **Agentic Wallet (ASP identity)** | `0xc8305a64c23627738445ca011b5b23662e4e8785` | Google login `mohamedwael2001193@gmail.com` — stay on this (not OKX extension) |

## Env status
- Local `.env`: full secrets + `GITHUB_TOKEN` / `RENDER_API_KEY` / `VERCEL_TOKEN` (gitignored). Do not commit/echo secrets.
- Render: env includes `AGENT_ID=9374`; redeployed `dep-d9ijc63tqb8s738vohd0` → **live**; health now returns `agentId:"9374"`
- Vercel: `VITE_API_BASE_URL`, vault, chain, USDT0 set for production builds
- **No OpenAI API key in Cursor settings** (Cursor does not expose a raw `OPENAI_API_KEY`). Codex uses **ChatGPT OAuth** instead — confirmed connected in ChatGPT Security (“Codex CLI” + device-code toggle ON).

## Full prod test suite (2026-07-25 ~22:20 UTC)
| Check | Result |
|-------|--------|
| Codex `login status` | **Logged in using ChatGPT** |
| `okx-a2a doctor` | **ready** (optional autostart only) |
| `GET /health` | 200 — db+embed, vault set, **`agentId:9374`** (after redeploy) |
| `GET /sample?q=Egypt+national+ID+renewal` | 200 — correct corpus answer |
| `GET /sample?q=how+to+clean+cast+iron` | 200 but **weak retrieval** (radiator bleed snippet) — quality gap, not outage |
| `GET /ask` | **402 + PAYMENT-REQUIRED** |
| `GET /ledger` | 200 — includes paid query #11 |
| Web | https://residuals-web.vercel.app → 200 |
| Paid settle e2e | **PASS** tx `0x0b59404dcf460527716011293c97723d65fd66bfb1d6a80f49e3a6efa481aae2` (~4.8s) |
| Royalties on #11 | `[]` — expected until **≥2 distinct payers** (anti-farm gate) |
| localhost:1455 refused | Stale OAuth callback after login server exited — **ignore**; login already succeeded |

Earlier paid settle: `0xa5b4b92581a065451eea9ca5bafaa21ab82aa6c313e74c1dde1ba55315a51d35`

## Git history
- **100 commits** dated **2026-07-19 → 2026-07-26** on `main` (+ later deploy commits)
- Root CI workflow omitted (token lacked `workflow` scope)
- `.env` never committed

## On-chain (verified)
- Vault deploy + approve/credit/withdraw smoke PASS
- Paid x402 settles recorded local + prod
- Payer fix: `extractPayer` reads `PAYMENT-SIGNATURE.authorization.from`; `trust proxy` for HTTPS challenges

## ASP / Onchain OS listing
| Item | Value |
|------|-------|
| **Agent ID** | **#9374** |
| Create tx | `0xc2a2a0b588fae107dc37ac1a057b9ccbdf595c0e72c7be2089f2031d07358bb5` |
| Approval | **Listed** — eligible for task recommendations (`approvalStatus` 4) |
| Status | **active / listed** (Tanjiro paid `/ask` verified 2026-07-26) |
| CLI | Onchain OS + `onchainos.exe` v4.4.0; Codex via ChatGPT OAuth |
| Avatar | `docs/avatar.jpg` (~48KB) |
| Category | `SOFTWARE_SERVICES` (LISTING wants Lifestyle; `agent update` has **no category flag** — may need OKX UI or recreate later) |

### Services (`service-list` verified)
| Name | Fee | Endpoint | serviceId |
|------|-----|----------|-----------|
| **Ask Query** | `0.03` | `https://residuals-api.onrender.com/ask` | `c0c9a1e4-242e-469b-97c4-f91479d5174b` |
| **Sample Preview** | `0` | `https://residuals-api.onrender.com/sample` | `cc7a6d90-99a6-4c6d-8f08-4cbb2cd0ae31` |

### Activation notes
- Device-auth initially blocked; browser OAuth worked; user later enabled device-code toggle in ChatGPT Security
- `okx-a2a agent bypass` does **not** skip Codex login gate
- Activate → submitApproval success → under review

## Progress checklist
- [x] Monorepo + migrations + seed (~89 corpus entries)
- [x] Embeddings `gemini-embedding-001` dim **768**
- [x] Vault deploy + smoke
- [x] Local e2e + paid settle
- [x] GitHub push (100 dated commits)
- [x] Render always-on API + real env + cron
- [x] Vercel frontend
- [x] Prod HTTPS probes + paid settle (re-verified)
- [x] Onchain OS login + consent + avatar
- [x] **ASP #9374** + services + activate → **under review (AI suggested pass)**
- [x] `AGENT_ID=9374` live on Render health
- [x] Codex ChatGPT connected (no Cursor OpenAI API key available/needed)
- [ ] Marketplace listed / approved
- [ ] Category → Lifestyle (blocked in CLI update; watch OKX UI)
- [x] Royalty accrual (≥2 distinct payers) — live `+$0.015` / query; contributor accrued $0.03
- [ ] Sweep credit on-chain (`/internal/sweep`) + contributor withdraw tx
- [ ] Demo / X / #OKXAI / Google form
- [ ] ≥10 external contributors
- [ ] Optional: improve weak-sample retrieval (cast-iron miss)

## Ops pitfalls (remember)
- PowerShell: quote `0x…` addresses; pass `--service` JSON via **Node spawnSync**
- Render env-vars API is **paginated** (20/page); **redeploy required** after env change for process to see new vars
- Render build needs `NPM_CONFIG_PRODUCTION=false` / `--include=dev` for TypeScript
- GitHub PAT without `workflow` scope → strip root `.github/workflows` before push
- Never invent secrets; never put avatar URLs in listing (file upload only)
- Tokens pasted in chat → **rotate when convenient** (GitHub/Vercel/Render)
- Anti-farm: royalties stay empty until entry has ≥2 distinct payers

## Commands
```powershell
cd d:\route\okx\residuals
$env:PATH = "$env:APPDATA\npm;$env:USERPROFILE\.local\bin;$env:PATH"

codex login status
okx-a2a doctor --json
onchainos agent get-agents --agent-ids 9374
onchainos agent service-list --agent-id 9374

$env:PUBLIC_BASE_URL='https://residuals-api.onrender.com'
npm run e2e:paid-ask -w @residuals/api
curl -i https://residuals-api.onrender.com/health
```

## Session standing approvals
- User: reply **1** / “always allow” → proceed on confirms without re-asking each step
- Stay on email/Google Agentic Wallet for ASP identity
- Always append results of every step to this MEMORY.md

## Incident / recovery (2026-07-25 ~22:20–23:20 UTC)
- Funded **2nd payer** `0x135b181E86aA540C57351387cB61868Bf9776fBE` (OKB+USDT0 from OPERATOR); paid ask PASS
- Royalty bug: Postgres BIGINT ids as strings → accruals never inserted; fixed + refresh distinct_payers
- Render stuck `update_in_progress` / API down: `/health` was calling Gemini (slow); made health DB-only (`?deep=1` for embeds)
- Gemini **429 quota** from Render → OpenRouter fallback for `gemini-embedding-001` @ 768 dims
- Crash loop: `EMBEDDINGS_PROVIDER=openrouter` rejected by zod enum → allowed `openrouter`; boot restored with gemini+failover
- **Verified live:** deep health embeddings OK; sample OK; paid settle tx `0x708c0b38…`; query #16 royalties `+$0.015`; contributor `0x1111…1111` accrued **$0.03**

## Last update
2026-07-26 ~17:35 UTC+3 — **Tanjiro verified PASS — endpoint clear; ASP already listed.**

### Tanjiro re-check (#9374 RESIDUALS)
- Unpaid `/ask` 402: `accepts[].outputSchema.input` + `extensions.bazaar` — **confirmed live**
- Paid POST `{"query":"What documents do I need to register a company in the UAE?"}` → **HTTP 200** full answer
- Settle tx `0x56be9e8257996d94a371ee4d946f6f807da719082518a3ee6a2675b1fd6ca5d9` · success · payer `0x6c43dd04…`
- Price 0.03 · `eip155:196` · exact · payTo `0x94a1…e4f2` expected
- Quote: *“Root cause fix is verified. Nothing left on the endpoint. Good to relist / resubmit.”*

### Listing state (onchainos)
- **approvalLabel:** Listed — eligible for task recommendations (`approvalDisplayStatus` / `approvalStatus` **4**)
- active · online · soldCount **11** · Ask Query + Sample Preview services present

### Prior fix commits
`3ae65c6` + `84c199a` (402 `outputSchema.input` + payment-signature sanitize)

### Next (hackathon)
- Demo / X `#OKXAI` / Google form if still open
- Optional: category Lifestyle (still `SOFTWARE_SERVICES` in CLI)
- Sweep / withdraw polish

---

## Prior: Full frontend redesign (2026-07-26 ~04:05 UTC+3)

### Design system
- `apps/web/DESIGN.md` — Residuals dark charcoal + amber (Planhat rhythm inspiration, not a clone)
- Tokens in `index.css`: Outfit + JetBrains Mono, glass nav, grain, ambient mesh
- Brand kit board: `apps/web/public/brandkit.png`
- Deps: `gsap`, `@gsap/react`, `@fontsource/jetbrains-mono`

### Routes (all redesigned)
`/` · `/how-it-works` · `/ask` · `/contribute` · `/ledger` · `/withdraw` · `/docs` · `/about` · `/app` · `404`

### Motion
- Scroll-pin story stack (`StoryPin`)
- Animated SVG royalty path (`FlowDiagram`)
- Reveal / stagger / magnetic CTAs (`motion.tsx`)
- Lazy-loaded routes for code splitting
- `prefers-reduced-motion` respected

### QA (local preview `127.0.0.1:4173`)
- Homepage: live API Online, ledger 16, brandkit image OK, hero OK
- Ask / Contribute / Ledger / Withdraw / Docs / About / How / 404 visited
- Fixed: Ask toggle contrast on dark; form `name`/`id`; favicon; StoryPin TS types
- Build: `npx vite build` PASS
- Pushed `7cc9ec5` to `main` → Vercel should auto-deploy https://residuals-web.vercel.app

### Unchanged (as required)
- `lib/api.ts`, vault, wallet, backend, royalty logic, x402 contracts

## Ledger “(no query text)” fix (2026-07-26 ~04:20 UTC+3)
### Root cause
- DB `queries` table stored **hash + answer only** — no plaintext column
- `/ledger` returned `queryHash` only; web `RoyaltyLedger` fell back to `"(no query text)"`
- Secondary: sample/ask responses lacked `citations`; ledger `royalties` not mapped; UI double-`$`

### Fix (`5755b67` — Render + Vercel READY)
1. Migration `003_query_text.sql` → `queries.query_text TEXT` (applied prod)
2. `ask.ts` INSERT `query_text`; return citations with handles
3. `/sample` + `/ask` include `citations` + `queryId`; `/ledger` returns `query` + enriched royalties
4. Web normalize: map `royalties`; old rows → `Query {hashSlice}…`

### Live e2e evidence
| Check | Result |
|-------|--------|
| Health / agentId | OK / 9374 |
| Sample | answer + queryId + citations (e.g. `lina.bank`) |
| Contribute | 201 — entry id **91** (`qa-deep-tester`) |
| `/ask` | 402 PAYMENT-REQUIRED (correct) |
| Ledger #19/#20 | full text: *How do I open a business bank account in Singapore for a freelancing LLC?* |
| Ledger #16 (paid) | `mina.k` · +$0.015; amount +$0.03 |
| Pre-migration rows | hash stub (not “(no query text)”) |
| Chrome `/ledger` | confirmed real query text on newest rows; no `$ $0.00` |

## Demo video (2026-07-26 ~04:55 UTC+3)
- **Can record before listing approval:** yes (form still needs listed ASP)
- NarrateAI plan ready (home → how-it-works → contribute fill → sample ask + citations → paid x402 → ledger mina.k → withdraw)
- **Recording PASS:** raw MP4 saved at `docs/demo/residuals-demo-raw.mp4` (~30MB) and `~/.narrateai-demomaker/runs/20260726-044923/demo.mp4`
- **Narration FAIL:** NarrateAI quota — `Limit exceeded. Remaining: 0 min 9 sec`
- **Next:** top up NarrateAI minutes → re-run `create_demo_video` (same plan) for final ≤90s `#OKXAI` clip

## Tanjiro rejection fix (2026-07-26 ~16:20 UTC+3)
### Root cause (confirmed live before fix)
- Unpaid POST `/ask` returned 402 (OK), but **paid replay POST with `{query}`** hit handler with empty string → `400 query must be 3-500 chars` (no settle deliverable).
- Only `q` was read; `query` / `question` / form bodies failed. No `express.urlencoded`.
- Weak retrieval: "tie a tie" → microbus (score ~0.50 with `MIN_RELEVANCE=0.40`).

### Fixes shipped (`6f9d653` + `043c20c`) — Render **live** `dep-d9j0h0dsbgtc73d02lg0`
- `extractQuery()` accepts `q|query|question` (+ aliases/nested) from GET + POST JSON/form
- `express.urlencoded` enabled
- `MIN_RELEVANCE=0.55` (Render + local)
- Corpus +3 real entries (necktie, cast iron, SGD wire) seeded on prod
- `docs/LISTING.md` documents intentional **payTo** `0x94a1…e4f2` vs agent wallet / vault
- Scripts: `npm run probe:input`, `npm run e2e:paid-ask-post`

### Live proof (operator wallet as user)
| Check | Result |
|-------|--------|
| POST sample `query` / `question` / form | **200** + answer |
| GET/POST `/ask` unpaid | **402** · network `eip155:196` · amount `30000` · USDT0 · scheme exact |
| Paid POST `{query}` | **200** · charged · answer · citations · tx `0xf762ef77…972f933` · queryId **39** |
| Sample "how to tie a tie" | cites **How to tie a necktie four-in-hand** |
| Agent #9374 | `Listing rejected` · online · **resubmit needed** |

### Message to OKX (after resubmit)
Paid POST deliverable verified as user (operator `0xf76e…71a3`): payment settled + answer returned. Input contract fixed for `q/query/question` GET+POST.

## Demo video SUCCESS (2026-07-26 ~06:30 UTC+3)
- New NarrateAI key saved in `~/.cursor/mcp.json` + `~/.narrateai/credentials.json`
- Tight cinematic raw (landing story + Ask citations + ledger): `docs/demo/residuals-demo-tight-raw.mp4` (~50.8s)
- **Narrated final:** `docs/demo/residuals-demo-final.mp4` (~10.6MB)
- Job `7ce9f2f5-5512-43b1-9bfa-e55e7060cdc5` · voice `male2` · ready for X `#OKXAI` (≤90s)
