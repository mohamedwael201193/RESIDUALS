# Deploy checklist (blocking for listing)

## 1. Fund operator (DONE)

Operator EOA (from `OPERATOR_PRIVATE_KEY`): `0xf76e6B0920e9332fF4410f6dD53F01722AbC71a3` on **X Layer mainnet (196)**

- OKB for gas (deploy + credit txs) — funded
- USD₮0 (`0x779Ded0c9e1022225f8E0630b35a9b54bE713736`) for royalty settlement — funded (~0.83)

Do **not** confuse with `PAY_TO` `0x94a18c39ac86b3a50f443db5083ec4132ab5e4f2` (OKX Agentic fee receiver).

## 2. Deploy vault (DONE)

Vault: `0x068bB96e849F0DE3D49944Ec0F4aEd3D6B165770` — see `contracts/deployments/xlayer-196.json`

Smoke PASS: approve → credit → withdraw. USDT0 already approved for vault from operator.

## 3. API host (always-on) — BLOCKING for ASP

Do **not** submit trycloudflare.com / free cold-start hosts to ASP review.

Files ready in repo:
- `Dockerfile` + `fly.toml` (Fly.io, region `sin`)
- `render.yaml` (Render Blueprint, Singapore + 10m cron)

Required: set dashboard secrets from `.env`, then set `PUBLIC_BASE_URL=https://…`.
Cron every 10m: `POST /internal/sweep` with header `x-cron-secret: $CRON_SECRET`.

Local tunnel (dev only): `cloudflared tunnel --url http://127.0.0.1:3000`

## 4. Frontend

- Vercel for `apps/web` (`apps/web/vercel.json`)
- `VITE_API_BASE_URL` = production API
- `VITE_VAULT_ADDRESS` = `0x068bB96e849F0DE3D49944Ec0F4aEd3D6B165770`
- CORS on API allows Vercel origin (`origin: true` already)

## 5. Listing

Follow `docs/LISTING.md`. Avatar: `docs/avatar.png` (≤1 MB). Validate with Onchain OS then activate.
