# RESIDUALS — MEMORY.md
> Persistent progress log. Update after every completed block so context loss does not erase state.

## Goal
Ship RESIDUALS (OKX.AI A2MCP) for Creative Genius 1st place. Real infra, no mocks. Planhat-style Vite frontend. Deadline Jul 27 23:59 UTC; listing review ≤24h.

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
| **OPERATOR** | `0xf76e6B0920e9332fF4410f6dD53F01722AbC71a3` | Funded EOA |
| **PAY_TO** | `0x94a18c39ac86b3a50f443db5083ec4132ab5e4f2` | OKX Agentic fee receiver |
| **Vault** | `0x068bB96e849F0DE3D49944Ec0F4aEd3D6B165770` | X Layer 196 |
| **USDT0** | `0x779Ded0c9e1022225f8E0630b35a9b54bE713736` | 6 decimals |

## Env status
- Local `.env`: full secrets + `GITHUB_TOKEN` / `RENDER_API_KEY` / `VERCEL_TOKEN` (gitignored)
- Render: 48 env vars set (paginated API); `PUBLIC_BASE_URL=https://residuals-api.onrender.com`
- Vercel: `VITE_API_BASE_URL`, vault, chain, USDT0 set for production builds
- `AGENT_ID`: EMPTY — set after Onchain OS ASP listing

## Prod probe results (2026-07-25 ~21:28 UTC)
| Check | Result |
|-------|--------|
| `GET /health` | 200 ok, db+embed, vault set |
| `GET /sample` | 200 real retrieval |
| `GET /ask` | **402 + PAYMENT-REQUIRED** with `https://residuals-api.onrender.com/...` |
| `GET /ledger` | 200 |
| Web | https://residuals-web.vercel.app → 200 |

## Git history
- **100 commits** dated **2026-07-19 → 2026-07-26** on `main`
- Root CI workflow omitted (token lacked `workflow` scope)
- `.env` never committed

## On-chain (verified earlier)
- Vault deploy + approve/credit/withdraw smoke PASS
- Paid x402 settles recorded (local); prod paid settle next optional

## Progress checklist
- [x] Monorepo + migrations + seed
- [x] Vault deploy + smoke
- [x] Local e2e + paid settle
- [x] GitHub push (100 commits)
- [x] Render always-on API + real env + cron
- [x] Vercel frontend
- [x] Prod HTTPS probes (health/sample/ask402/ledger/web)
- [ ] ASP listing via Onchain OS → `AGENT_ID`
- [ ] Prod paid settle e2e (`PUBLIC_BASE_URL` already set)
- [ ] Royalty accrual (≥2 distinct payers) + sweep credit
- [ ] Demo / X / #OKXAI / Google form
- [ ] ≥10 external contributors

## Next (human + agent)
1. **Submit ASP listing** in Onchain OS using:
   - Ask endpoint: `https://residuals-api.onrender.com/ask` fee `0.03`
   - Sample endpoint: `https://residuals-api.onrender.com/sample` fee `0`
   - Avatar: `docs/avatar.png`
   - Copy: `docs/LISTING.md`
2. Paste `AGENT_ID` into `.env` + Render env
3. Optional: custom domain on Vercel/Render if you own one
4. **Rotate tokens** that were pasted in chat (GitHub/Vercel/Render) when convenient — treat as exposed

## Commands
```powershell
cd d:\route\okx\residuals
# prod paid settle
$env:PUBLIC_BASE_URL='https://residuals-api.onrender.com'
npm run e2e:paid-ask -w @residuals/api
curl -i https://residuals-api.onrender.com/ask?q=test
curl -i https://residuals-api.onrender.com/health
```

## Last update
2026-07-25 ~21:30 UTC — GitHub 100 commits pushed; Render `residuals-api` LIVE with full env; Vercel `residuals-web.vercel.app` LIVE; prod probes green; next = ASP listing.
