import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractPayer } from "./x402.js";

describe("extractPayer", () => {
  it("reads authorization.from from PAYMENT-SIGNATURE", () => {
    const payload = {
      x402Version: 2,
      payload: {
        authorization: {
          from: "0xf76e6B0920e9332fF4410f6dD53F01722AbC71a3",
          to: "0x94a18c39ac86b3a50f443db5083ec4132ab5e4f2",
          value: "30000",
        },
      },
    };
    const hdr = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
    const payer = extractPayer({ headers: { "payment-signature": hdr } });
    assert.equal(payer, "0xf76e6b0920e9332ff4410f6dd53f01722abc71a3");
  });

  it("returns null when unpaid", () => {
    assert.equal(extractPayer({ headers: {} }), null);
  });
});
