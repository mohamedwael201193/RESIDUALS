import { createHash } from "node:crypto";
import { db } from "./db/client.js";
import type { RetrievedEntry } from "./retrieval.js";

const NEAR_DUP_COSINE = 0.97;

export function queryHash(q: string): string {
  return createHash("sha256").update(q.trim().toLowerCase()).digest("hex");
}

/** Exclude payer-authored entries from royalty eligibility. */
export function excludePayerEntries(
  entries: RetrievedEntry[],
  payer: string | null | undefined,
): RetrievedEntry[] {
  if (!payer) return entries;
  const p = payer.toLowerCase();
  return entries.filter((e) => e.contributor.toLowerCase() !== p);
}

/** Only entries with distinct_payers >= 2 may accrue (anti self-deal bootstrapping). */
export function filterAccrualEligible(
  entries: RetrievedEntry[],
): RetrievedEntry[] {
  return entries.filter((e) => e.distinct_payers >= 2);
}

export async function recordPayerSeen(
  payer: string,
  entryIds: number[],
): Promise<void> {
  if (!payer || entryIds.length === 0) return;
  const sql = db();
  for (const id of entryIds) {
    await sql`
      INSERT INTO payer_entry_seen (payer, entry_id)
      VALUES (${payer.toLowerCase()}, ${id})
      ON CONFLICT DO NOTHING
    `;
    await sql`
      UPDATE entries
      SET distinct_payers = (
        SELECT count(DISTINCT payer)::int FROM payer_entry_seen WHERE entry_id = ${id}
      )
      WHERE id = ${id}
    `;
  }
}

export async function isNearDuplicate(
  embeddingVec: string,
  contributor: string,
): Promise<boolean> {
  const rows = await db()`
    SELECT (1 - (embedding <=> ${embeddingVec}::vector))::float8 AS score
    FROM entries
    WHERE contributor = ${contributor.toLowerCase()}
      AND status = 'active'
    ORDER BY embedding <=> ${embeddingVec}::vector
    LIMIT 1
  `;
  const score = Number(rows[0]?.score ?? 0);
  return score >= NEAR_DUP_COSINE;
}

export async function contributorPublishCount24h(
  address: string,
): Promise<number> {
  const rows = await db()`
    SELECT count(*)::int AS c
    FROM entries
    WHERE contributor = ${address.toLowerCase()}
      AND created_at > now() - interval '24 hours'
  `;
  return Number(rows[0]?.c ?? 0);
}
