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

export type AskResult = {
  answer: string;
  charged: boolean;
  paidMicros: string;
  entryIds: number[];
  scores: number[];
  queryId: number | null;
};

export async function runAsk(params: {
  q: string;
  payer: string | null;
  charge: boolean;
  sample?: boolean;
}): Promise<AskResult> {
  const e = env();
  const q = params.q.trim();
  if (q.length < 3 || q.length > 500) {
    throw Object.assign(new Error("query must be 3-500 chars"), { status: 400 });
  }

  const retrieved = await retrieve(q);
  if (retrieved.length === 0) {
    const answer =
      "No contributor knowledge covers this yet. Try a more specific practical question, or contribute an entry.";
    const [row] = await db()`
      INSERT INTO queries (query_hash, payer, paid_micros, entry_ids, scores, charged, answer)
      VALUES (
        ${queryHash(q)},
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
    };
  }

  const answer = params.sample
    ? composeSample(q, retrieved)
    : await composeAnswer(q, retrieved);

  const paid = params.charge ? usdToMicros(e.QUERY_PRICE_USD) : 0n;
  const entryIds = retrieved.map((r) => r.id);
  const scores = retrieved.map((r) => r.score);

  const [row] = await db()`
    INSERT INTO queries (query_hash, payer, paid_micros, entry_ids, scores, charged, answer)
    VALUES (
      ${queryHash(q)},
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

  if (params.charge && params.payer && paid > 0n) {
    await recordPayerSeen(params.payer, entryIds);
    // Re-read distinct_payers so the unlocking query can accrue immediately.
    const fresh = await withFreshDistinctPayers(retrieved);
    const eligible = filterAccrualEligible(
      excludePayerEntries(fresh, params.payer),
    );
    if (eligible.length > 0) {
      try {
        await accrueRoyalties({
          queryId,
          paidMicros: paid,
          entries: eligible,
        });
      } catch (err) {
        // Payment already settled — never fail the paid response on accrual.
        console.error("accrueRoyalties failed", { queryId, err });
      }
    }
  }

  return {
    answer,
    charged: params.charge,
    paidMicros: paid.toString(),
    entryIds,
    scores,
    queryId,
  };
}
