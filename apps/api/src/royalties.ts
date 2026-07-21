import { splitRoyalties } from "@residuals/shared";
import { db } from "./db/client.js";
import { env } from "./env.js";
import type { RetrievedEntry } from "./retrieval.js";

export async function accrueRoyalties(params: {
  queryId: number;
  paidMicros: bigint;
  entries: RetrievedEntry[];
}): Promise<void> {
  const e = env();
  const shares = splitRoyalties({
    paidMicros: params.paidMicros,
    royaltyBps: e.ROYALTY_BPS,
    entries: params.entries.map((x) => ({
      entryId: x.id,
      score: x.score,
    })),
  });

  const sql = db();
  for (const share of shares) {
    const entry = params.entries.find((x) => x.id === Number(share.entryId));
    if (!entry || share.micros <= 0n) continue;
    await sql`
      INSERT INTO accruals (contributor, entry_id, query_id, micros)
      VALUES (
        ${entry.contributor.toLowerCase()},
        ${entry.id},
        ${params.queryId},
        ${share.micros.toString()}
      )
    `;
  }
}

export async function contributorBalances(address: string) {
  const a = address.toLowerCase();
  const sql = db();
  const [row] = await sql<{ accrued: string; settled: string }[]>`
    SELECT
      COALESCE(SUM(micros), 0)::text AS accrued,
      COALESCE(SUM(CASE WHEN settled_tx IS NOT NULL THEN micros ELSE 0 END), 0)::text AS settled
    FROM accruals
    WHERE contributor = ${a}
  `;
  const accrued = BigInt(row?.accrued ?? "0");
  const settled = BigInt(row?.settled ?? "0");
  return {
    address: a,
    accruedMicros: accrued.toString(),
    settledMicros: settled.toString(),
    pendingMicros: (accrued - settled).toString(),
  };
}
