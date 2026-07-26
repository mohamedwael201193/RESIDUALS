# RESIDUALS — OKX.AI ASP listing copy

**Agent name:** RESIDUALS  
**Category:** Lifestyle  
**Protocol:** A2MCP  

## Description (≤500 chars)

RESIDUALS answers practical how-to questions from a human-contributed knowledge corpus. Paid `/ask` (0.03 USD₮0 via x402 on X Layer) retrieves matching entries, returns an answer composed only from those entries with citations, and accrues a published share of the fee to cited contributors for ResidualsVault withdrawal. Free `/sample` returns a shortened preview with no fee.

## payTo (x402 fee receiver) — intentional

| Role | Address |
|------|---------|
| **payTo (x402)** | `0x94a18c39ac86b3a50f443db5083ec4132ab5e4f2` |
| **ASP / Agentic Wallet (listing owner)** | `0xc8305a64c23627738445ca011b5b23662e4e8785` |
| **ResidualsVault (contributor royalties)** | `0x068bB96e849F0DE3D49944Ec0F4aEd3D6B165770` |

`payTo` is the OKX-linked settlement wallet for query fees (operator share). Contributor royalties accrue separately into ResidualsVault — not the same address. Do **not** change `payTo` to the agent wallet unless OKX support requires it.

## Network / token (402 challenge)

- **network (CAIP-2):** `eip155:196` (X Layer)
- **asset:** USD₮0 `0x779Ded0c9e1022225f8E0630b35a9b54bE713736`
- **amount:** `30000` micros = **0.03** USD₮0
- **scheme:** `exact`
- **SDK:** `@okxweb3/x402-express` + `OKXFacilitatorClient` ([Seller SDK docs](https://web3.okx.com/onchainos/dev-docs/payments/service-seller-sdk))

## Service 1 — Ask

- **serviceName:** Ask Query  
- **serviceType:** A2MCP  
- **fee:** `0.03`  
- **endpoint:** `https://residuals-api.onrender.com/ask`  

**serviceDescription:**  
1) Submit a practical how-to question via GET `?q=` or POST JSON/form with `q` / `query` / `question`.  
2) After x402 settlement, receive an answer composed only from retrieved contributor entries plus citation handles.  
3) A published share of the 0.03 USD₮0 fee accrues to cited contributors for later vault withdrawal.

## Service 2 — Sample

- **serviceName:** Sample Preview  
- **serviceType:** A2MCP  
- **fee:** `0`  
- **endpoint:** `https://residuals-api.onrender.com/sample`  

**serviceDescription:**  
1) Submit a practical question the same way as Ask (GET or POST).  
2) Receive a shortened preview drawn from contributor knowledge when relevance is high enough.  
3) No fee is charged and no royalty is accrued on sample calls.

## Avatar

Local file ≤1 MB, **1:1 square, no rounded corners**: `docs/avatar.jpg` / `docs/avatar.png`.

## Probe checklist (before resubmit)

```bash
# unpaid
curl -i "https://residuals-api.onrender.com/ask?q=test"   # 402 + PAYMENT-REQUIRED
curl -i -X POST "https://residuals-api.onrender.com/ask" -H 'content-type: application/json' -d '{"query":"How do I open a bank account in Singapore"}'  # 402
curl -i -X POST "https://residuals-api.onrender.com/sample" -H 'content-type: application/json' -d '{"query":"How do I open a bank account in Singapore"}'  # 200 + answer
curl -i "https://residuals-api.onrender.com/health"       # 200

# paid (operator wallet) — POST replay path
npm run e2e:paid-ask-post -w @residuals/api
```

Frontend: https://residuals-web.vercel.app  
Repo: https://github.com/mohamedwael201193/RESIDUALS

## Notes

- Never use earn forever / passive income / guaranteed / yield / APY language.  
- Host is Render **starter** always-on in Singapore (`residuals-api`).  
- Agent ID: **#9374** — resubmit after paid POST deliverable is verified.
