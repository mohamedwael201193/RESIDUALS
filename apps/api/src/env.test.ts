import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadEnv, resetEnvCache } from "./env.js";

describe("loadEnv", () => {
  it("fails fast on missing OKX_API_KEY", () => {
    resetEnvCache();
    assert.throws(
      () =>
        loadEnv({
          ...process.env,
          OKX_API_KEY: "",
        }),
      /Invalid environment/,
    );
  });

  it("loads current process env", () => {
    resetEnvCache();
    const e = loadEnv(process.env);
    assert.ok(e.OKX_API_KEY.length > 0);
    assert.equal(e.EMBEDDINGS_DIMENSIONS, 768);
    assert.equal(e.QUERY_PRICE_USD, "0.03");
  });
});
