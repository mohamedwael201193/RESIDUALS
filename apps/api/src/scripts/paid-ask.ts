/**
 * Real mainnet x402 paid /ask e2e.
 * Spends QUERY_PRICE_USD (0.03) USDT0 from OPERATOR to PAY_TO via facilitator.
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

  // toClientEvmSigner(viem wallet) currently yields address=undefined on this
  // viem version — pass the account directly to registerExactEvmScheme.
  const client = new x402Client();
  registerExactEvmScheme(client, {
    signer: account,
    networks: ["eip155:196"],
    schemeOptions: { rpcUrl: e.XLAYER_RPC_URL },
  });

  // Do NOT set validateStatus to always-true — the x402 axios interceptor
  // only runs on the error path when status is 402.
  const api = wrapAxiosWithPayment(
    axios.create({
      baseURL: base,
      timeout: 90_000,
    }),
    client,
  );

  const q =
    "How do I renew Egypt national ID while living abroad?";
  console.log(
    JSON.stringify({
      base,
      payer: account.address,
      payTo: e.PAY_TO,
      q,
    }),
  );

  const started = Date.now();
  const res = await api.get("/ask", { params: { q } });
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

  console.log(
    JSON.stringify(
      {
        status: res.status,
        latencyMs: ms,
        payment,
        data: res.data,
      },
      null,
      2,
    ),
  );

  if (res.status !== 200) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
