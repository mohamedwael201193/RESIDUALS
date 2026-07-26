import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ASK_OUTPUT_SCHEMA,
  injectAskInputSchema,
  sanitizePaymentSignature,
} from "./x402.js";

describe("injectAskInputSchema", () => {
  it("adds accepts[].outputSchema.input with POST json query required", () => {
    const raw = {
      x402Version: 2,
      resource: { url: "https://residuals-api.onrender.com/ask" },
      accepts: [
        {
          scheme: "exact",
          network: "eip155:196",
          amount: "30000",
          asset: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736",
          payTo: "0x94a18c39ac86b3a50f443db5083ec4132ab5e4f2",
        },
      ],
    };
    const encoded = Buffer.from(JSON.stringify(raw), "utf8").toString("base64");
    const out = JSON.parse(
      Buffer.from(injectAskInputSchema(encoded), "base64").toString("utf8"),
    ) as {
      accepts: Array<{ outputSchema?: typeof ASK_OUTPUT_SCHEMA }>;
      extensions?: { bazaar?: unknown };
    };

    const input = out.accepts[0]?.outputSchema?.input;
    assert.equal(input?.type, "http");
    assert.equal(input?.method, "POST");
    assert.equal(input?.bodyType, "json");
    assert.ok(input?.schema?.required?.includes("query"));
    assert.equal(typeof input?.body?.query, "string");
  });
});

describe("sanitizePaymentSignature", () => {
  it("strips accepted.outputSchema so facilitator verify can succeed", () => {
    const raw = {
      x402Version: 2,
      accepted: {
        scheme: "exact",
        network: "eip155:196",
        amount: "30000",
        asset: "0x779ded0c9e1022225f8e0630b35a9b54be713736",
        payTo: "0x94a18c39ac86b3a50f443db5083ec4132ab5e4f2",
        maxTimeoutSeconds: 300,
        outputSchema: ASK_OUTPUT_SCHEMA,
      },
      payload: { authorization: { from: "0xabc" } },
      extensions: { bazaar: { info: {} }, outputSchema: ASK_OUTPUT_SCHEMA },
    };
    const encoded = Buffer.from(JSON.stringify(raw), "utf8").toString("base64");
    const out = JSON.parse(
      Buffer.from(sanitizePaymentSignature(encoded), "base64").toString("utf8"),
    ) as {
      accepted: Record<string, unknown>;
      extensions?: Record<string, unknown>;
    };
    assert.equal(out.accepted.outputSchema, undefined);
    assert.equal(out.accepted.amount, "30000");
    assert.equal(out.extensions?.outputSchema, undefined);
    assert.ok(out.extensions?.bazaar);
  });
});
