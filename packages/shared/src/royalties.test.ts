import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { splitRoyalties } from "./royalties.js";

describe("splitRoyalties", () => {
  it("splits pool proportional to scores and reconciles remainder", () => {
    const paid = 30_000n; // $0.03
    const shares = splitRoyalties({
      paidMicros: paid,
      royaltyBps: 5000,
      entries: [
        { entryId: 1, score: 0.5 },
        { entryId: 2, score: 0.3 },
        { entryId: 3, score: 0.2 },
      ],
    });
    const pool = 15_000n;
    const sum = shares.reduce((a, s) => a + s.micros, 0n);
    assert.equal(sum, pool);
    assert.equal(shares[0]!.entryId, 1);
    assert.ok(shares[0]!.micros >= shares[1]!.micros);
  });

  it("assigns entire pool to top when scores are zero", () => {
    const shares = splitRoyalties({
      paidMicros: 30_000n,
      royaltyBps: 5000,
      entries: [
        { entryId: 9, score: 0 },
        { entryId: 8, score: 0 },
      ],
    });
    assert.equal(shares.length, 1);
    assert.equal(shares[0]!.entryId, 9);
    assert.equal(shares[0]!.micros, 15_000n);
  });

  it("returns empty for empty entries", () => {
    assert.deepEqual(
      splitRoyalties({ paidMicros: 30_000n, royaltyBps: 5000, entries: [] }),
      [],
    );
  });
});
