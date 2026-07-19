/**
 * Split royalty pool across retrieved entries proportional to relevance scores.
 * Integer arithmetic; remainder goes to the top-scoring entry.
 */

export type RoyaltyShare = {
  entryId: bigint | number;
  micros: bigint;
  score: number;
};

export function splitRoyalties(params: {
  paidMicros: bigint | number;
  royaltyBps: number;
  entries: Array<{ entryId: bigint | number; score: number }>;
}): RoyaltyShare[] {
  const paid =
    typeof params.paidMicros === "number"
      ? BigInt(params.paidMicros)
      : params.paidMicros;
  if (params.royaltyBps < 0 || params.royaltyBps > 10_000) {
    throw new Error("royaltyBps out of range");
  }
  if (params.entries.length === 0) return [];

  const pool = (paid * BigInt(params.royaltyBps)) / 10_000n;
  if (pool <= 0n) return [];

  const sorted = [...params.entries].sort((a, b) => b.score - a.score);
  const totalScore = sorted.reduce((acc, e) => acc + Math.max(0, e.score), 0);
  if (totalScore <= 0) {
    return [
      {
        entryId: sorted[0]!.entryId,
        micros: pool,
        score: sorted[0]!.score,
      },
    ];
  }

  const shares: RoyaltyShare[] = [];
  let allocated = 0n;
  for (let i = 0; i < sorted.length; i++) {
    const e = sorted[i]!;
    const weight = Math.max(0, e.score) / totalScore;
    let micros =
      i === sorted.length - 1
        ? pool - allocated
        : BigInt(Math.floor(Number(pool) * weight));
    if (i < sorted.length - 1) allocated += micros;
    if (micros < 0n) micros = 0n;
    shares.push({ entryId: e.entryId, micros, score: e.score });
  }

  // Reconcile: sum must equal pool; dump remainder onto top entry.
  const sum = shares.reduce((a, s) => a + s.micros, 0n);
  if (sum !== pool && shares.length > 0) {
    const top = shares[0]!;
    top.micros += pool - sum;
  }

  return shares.filter((s) => s.micros > 0n);
}
