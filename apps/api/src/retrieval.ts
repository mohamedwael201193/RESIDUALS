import { db } from "./db/client.js";
import { env } from "./env.js";
import { embed, toPgVector } from "./embeddings.js";

export type RetrievedEntry = {
  id: number;
  contributor: string;
  topic: string;
  body: string;
  region: string | null;
  score: number;
  distinct_payers: number;
};

export async function retrieve(
  query: string,
  opts?: { topK?: number; minRelevance?: number },
): Promise<RetrievedEntry[]> {
  const e = env();
  const topK = opts?.topK ?? e.TOP_K;
  const min = opts?.minRelevance ?? e.MIN_RELEVANCE;
  const vector = await embed(query);
  const vec = toPgVector(vector);

  const rows = await db()<RetrievedEntry[]>`
    SELECT
      id,
      contributor,
      topic,
      body,
      region,
      distinct_payers,
      (1 - (embedding <=> ${vec}::vector))::float8 AS score
    FROM entries
    WHERE status = 'active'
    ORDER BY embedding <=> ${vec}::vector
    LIMIT ${topK}
  `;

  // postgres.js returns BIGINT as string — normalize before accrual / JSON.
  return rows
    .map((r) => ({
      ...r,
      id: Number(r.id),
      distinct_payers: Number(r.distinct_payers),
      score: Number(r.score),
    }))
    .filter((r) => r.score >= min);
}
