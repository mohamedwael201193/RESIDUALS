import { usdToMicros } from "@residuals/shared";
import {
  excludePayerEntries,
  filterAccrualEligible,
  queryHash,
  recordPayerSeen,
  withFreshDistinctPayers,
} from "./antifarm.js";
import { composeAnswer, composeSample } from "./compose.js";
import { db } from "./db/client.js";
import { env } from "./env.js";
import { retrieve } from "./retrieval.js";
import { accrueRoyalties } from "./royalties.js";

export type AskCitation = {
  entryId: number;
  handle: string;
  topic: string;
  contributor: string;
  score: number;
  snippet: string;
};

export type AskResult = {
  answer: string;
  charged: boolean;
  paidMicros: string;
  entryIds: number[];
  scores: number[];
  queryId: number | null;
  citations: AskCitation[];
};

function citationsFrom(retrieved: Awaited<ReturnType<typeof retrieve>>): AskCitation[] {
  return retrieved.map((r) => ({
    entryId: r.id,
    handle: r.contributor.slice(0, 6) + "…" + r.contributor.slice(-4),
    topic: r.topic,
    contributor: r.contributor,
    score: r.score,
    snippet: r.body.length > 160 ? `${r.body.slice(0, 157)}…` : r.body,
  }));
}

export async function runAsk(params: {
  q: string;
  payer: string | null;
  charge: boolean;
  sample?: boolean;
}): Promise<AskResult> {
  const e = env();
  const q = params.q.trim();
  if (q.length < 3 || q.length > 500) {
    throw Object.assign(
      new Error("query must be 3-500 chars (send q, query, or question via GET or POST)"),
      { status: 400 },
    );
  }

  const retrieved = await retrieve(q);
  if (retrieved.length === 0) {
    const answer =
      "No contributor knowledge covers this yet. Try a more specific practical question, or contribute an entry.";
    const [row] = await db()`
      INSERT INTO queries (query_hash, query_text, payer, paid_micros, entry_ids, scores, charged, answer)
      VALUES (
        ${queryHash(q)},
        ${q},
        ${params.payer},
        ${0},
        ${[] as number[]},
        ${[] as number[]},
        ${false},
        ${answer}
      )
      RETURNING id
    `;
    return {
      answer,
      charged: false,
      paidMicros: "0",
      entryIds: [],
      scores: [],
      queryId: Number(row!.id),
      citations: [],
    };
  }

  const answer = params.sample
    ? composeSample(q, retrieved)
    : await composeAnswer(q, retrieved);

  const paid = params.charge ? usdToMicros(e.QUERY_PRICE_USD) : 0n;
  const entryIds = retrieved.map((r) => r.id);
  const scores = retrieved.map((r) => r.score);

  const [row] = await db()`
    INSERT INTO queries (query_hash, query_text, payer, paid_micros, entry_ids, scores, charged, answer)
    VALUES (
      ${queryHash(q)},
      ${q},
      ${params.payer},
      ${paid.toString()},
      ${entryIds},
      ${scores},
      ${params.charge},
      ${answer}
    )
    RETURNING id
  `;
  const queryId = Number(row!.id);

  // Prefer contributor handles when available.
  const handleRows = await db()`
    SELECT address, handle FROM contributors
    WHERE address = ANY(${retrieved.map((r) => r.contributor)})
  `;
  const handleByAddr = new Map(
    handleRows.map((h) => [String(h.address).toLowerCase(), String(h.handle)]),
  );
  const citations = citationsFrom(retrieved).map((c) => ({
    ...c,
    handle: handleByAddr.get(c.contributor.toLowerCase()) ?? c.handle,
  }));

  if (params.charge && params.payer && paid > 0n) {
    try {
      await recordPayerSeen(params.payer, entryIds);
      // Re-read distinct_payers so the unlocking query can accrue immediately.
      const fresh = await withFreshDistinctPayers(retrieved);
      const eligible = filterAccrualEligible(
        excludePayerEntries(fresh, params.payer),
      );
      if (eligible.length > 0) {
        await accrueRoyalties({
          queryId,
          paidMicros: paid,
          entries: eligible,
        });
      }
    } catch (err) {
      // Payment already settled — never fail the paid response on accrual.
      console.error("royalty path failed", { queryId, err });
    }
  }

  return {
    answer,
    charged: params.charge,
    paidMicros: paid.toString(),
    entryIds,
    scores,
    queryId,
    citations,
  };
}
