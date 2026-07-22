# RESIDUALS — OKX.AI ASP listing copy

**Agent name:** RESIDUALS  
**Category:** Lifestyle  
**Protocol:** A2MCP  

## Description (≤500 chars)

RESIDUALS answers practical how-to questions from a human-contributed knowledge corpus. Each paid query retrieves the most relevant contributor entries, composes an answer from that material only, and accrues a published share of the query fee to the contributors whose entries were cited. Contributors withdraw USD₮0 on X Layer.

## Service 1 — Ask

- **serviceName:** Ask  
- **serviceType:** A2MCP  
- **fee:** `0.03`  
- **endpoint:** `{PUBLIC_BASE_URL}/ask`  

**serviceDescription (3 parts):**  
1) Submit a practical how-to question via GET or POST.  
2) Receive an answer composed only from retrieved contributor entries.  
3) A published share of the 0.03 USD₮0 query fee accrues to cited contributors for later withdrawal.

## Service 2 — Sample

- **serviceName:** Sample  
- **serviceType:** A2MCP  
- **fee:** `0`  
- **endpoint:** `{PUBLIC_BASE_URL}/sample`  

**serviceDescription (3 parts):**  
1) Submit a practical question for a free shortened preview.  
2) Receive a capped sample drawn from contributor knowledge.  
3) No fee is charged and no royalty is accrued on sample calls.

## Avatar

Local file ≤1 MB (URLs rejected): `docs/avatar.png` (copy of reeded-glass hero).

## Probe checklist (before submit)

```bash
curl -i -X GET  "$PUBLIC_BASE_URL/ask?q=test"    # 402 + PAYMENT-REQUIRED
curl -i -X POST "$PUBLIC_BASE_URL/ask" -H 'content-type: application/json' -d '{"q":"test"}'
curl -i -X GET  "$PUBLIC_BASE_URL/sample?q=test" # 200
curl -i          "$PUBLIC_BASE_URL/health"       # 200
```

## Notes

- Never use earn forever / passive income / guaranteed / yield / APY language.  
- Host must be always-on HTTPS (no free-tier cold starts).  
- Record Agent ID here after submission: `AGENT_ID=`
