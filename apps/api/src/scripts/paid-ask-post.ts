/**
 * Paid /ask e2e via POST JSON { query } — matches OKX buyer / reviewer replay path.
 */
import axios from "axios";
import {
  wrapAxiosWithPayment,
  decodePaymentResponseHeader,
  x402Client,
} from "@okxweb3/x402-axios";
import { registerExactEvmScheme } from "@okxweb3/x402-evm/exact/client";
import { privateKeyToAccount } from "viem/accounts";
import { loadEnv, env } from "../env.js";

async function main() {
  loadEnv();
  const e = env();
  const base = (e.PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
  const pk = e.OPERATOR_PRIVATE_KEY as `0x${string}`;
  const account = privateKeyToAccount(pk);

  const client = new x402Client();
  registerExactEvmScheme(client, {
    signer: account,
    networks: ["eip155:196"],
    schemeOptions: { rpcUrl: e.XLAYER_RPC_URL },
  });

  const api = wrapAxiosWithPayment(
    axios.create({
      baseURL: base,
      timeout: 90_000,
      headers: { "content-type": "application/json" },
    }),
    client,
  );

  const query =
    "How do I open a business bank account in Singapore for a freelancing LLC?";
  console.log(
    JSON.stringify({
      base,
      payer: account.address,
      payTo: e.PAY_TO,
      method: "POST",
      body: { query },
    }),
  );

  const started = Date.now();
  const res = await api.post("/ask", { query });
  const ms = Date.now() - started;
  const paymentHdr =
    (res.headers["payment-response"] as string | undefined) ||
    (res.headers["PAYMENT-RESPONSE"] as string | undefined);
  let payment: unknown = null;
  if (paymentHdr) {
    try {
      payment = decodePaymentResponseHeader(paymentHdr);
    } catch {
      payment = { rawLen: paymentHdr.length };
    }
  }

  const data = res.data as {
    answer?: string;
    queryId?: number;
    citations?: unknown[];
    charged?: boolean;
  };

  console.log(
    JSON.stringify(
      {
        status: res.status,
        latencyMs: ms,
        payment,
        queryId: data.queryId,
        charged: data.charged,
        citationCount: Array.isArray(data.citations) ? data.citations.length : 0,
        answerPreview: String(data.answer ?? "").slice(0, 220),
      },
      null,
      2,
    ),
  );

  if (res.status !== 200 || !data.answer) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
