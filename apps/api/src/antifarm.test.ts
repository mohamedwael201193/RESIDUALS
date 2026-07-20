import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  excludePayerEntries,
  filterAccrualEligible,
  queryHash,
} from "./antifarm.js";
import type { RetrievedEntry } from "./retrieval.js";

const base = (over: Partial<RetrievedEntry>): RetrievedEntry => ({
  id: 1,
  contributor: "0x1111111111111111111111111111111111111111",
  topic: "t",
  body: "b".repeat(80),
  region: null,
  score: 0.8,
  distinct_payers: 2,
  ...over,
});

describe("antifarm", () => {
  it("hashes queries stably", () => {
    assert.equal(queryHash("Hello"), queryHash("hello"));
  });

  it("excludes payer-authored entries", () => {
    const payer = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const out = excludePayerEntries(
      [
        base({ id: 1, contributor: payer }),
        base({ id: 2, contributor: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" }),
      ],
      payer,
    );
    assert.equal(out.length, 1);
    assert.equal(out[0]!.id, 2);
  });

  it("requires distinct_payers >= 2 for accrual", () => {
    const out = filterAccrualEligible([
      base({ id: 1, distinct_payers: 1 }),
      base({ id: 2, distinct_payers: 2 }),
    ]);
    assert.equal(out.length, 1);
    assert.equal(out[0]!.id, 2);
  });
});
