# RESIDUALS — 90-second demo shot list

Record against **live** prod: https://residuals-web.vercel.app · API https://residuals-api.onrender.com · Agent **#9374**

## Beats (from WINNING_IDEA §9)

| t | Shot | What to show |
|---|------|----------------|
| 0–10s | Cold open | Generic AI gives a wrong “official docs” answer. Cut: *“Nobody pays the person who knows what actually happens.”* |
| 10–25s | Contribute | Named contributor (handle on screen) pastes hard-won how-to + X Layer address → `POST /contribute` free. Entry live. |
| 25–45s | Paid ask | `GET /ask?q=…` → 402 → settle → answer **&lt;2s** citing that contributor’s entry by topic/handle. |
| 45–60s | Split | Receipt: buyer **$0.03**, contributor **+$0.015** on ledger. Number moves. |
| 60–72s | Second buyer | Different payer, related question, same entry → another **+$0.01x**. *“That is a residual.”* |
| 72–85s | Withdraw | Contributor `withdraw()` → USD₮0 in wallet. **X Layer explorer + tx hash** full-screen. |
| 85–90s | Close | *“One paragraph. Paid every time a machine needs it.”* End card: marketplace + site + `#OKXAI`. |

## Live proof anchors (update if new txs land)

| Fact | Value |
|------|--------|
| Agent ID | **#9374** (Listing under review) |
| Ask endpoint | `https://residuals-api.onrender.com/ask` (0.03 USDT0) |
| Sample | `https://residuals-api.onrender.com/sample` (free) |
| Example paid settle | `0x708c0b38a524e12532560e0be59d3e7cd1a2f21c30bce1c68c9e0aaa74399e93` |
| Example contributor | `0x1111111111111111111111111111111111111111` (seed `mina.k`) — accrued/settled **$0.03** after sweep |
| Vault credit txs | `0xbe0bf50618e1367446762e3cf0134faadd5908c0d1d4f92dffad470873a7b002` · `0x590f89bbf8b11c2e4c0360692e73de474f92f9fb89bd4a61440a250c597cf46d` |
| Vault | `0x068bB96e849F0DE3D49944Ec0F4aEd3D6B165770` (X Layer 196) |
| Explorer | https://www.okx.com/explorer/xlayer/tx/0xbe0bf50618e1367446762e3cf0134faadd5908c0d1d4f92dffad470873a7b002 |

## Capture checklist

- [ ] Mic + screen at 1080p; no “guaranteed / APY / earn forever” language
- [ ] Show **dollar** amounts, not micros
- [ ] Show **citation** with contributor handle
- [ ] Show **second distinct payer**
- [ ] Show **explorer tx** for withdraw or vault `credit`
- [ ] Export ≤90s MP4 → attach to X post `#OKXAI`
