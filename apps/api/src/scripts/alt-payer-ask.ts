/**
 * Paid /ask using SECOND_PAYER_PRIVATE_KEY from .env (already funded).
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
  const pk = (process.env.SECOND_PAYER_PRIVATE_KEY || "") as `0x${string}`;
  if (!pk.startsWith("0x")) {
    throw new Error("SECOND_PAYER_PRIVATE_KEY missing in env");
  }
  const account = privateKeyToAccount(pk);
  const client = new x402Client();
  registerExactEvmScheme(client, {
    signer: account,
    networks: ["eip155:196"],
    schemeOptions: { rpcUrl: e.XLAYER_RPC_URL },
  });
  const base = (e.PUBLIC_BASE_URL || "https://residuals-api.onrender.com").replace(
    /\/$/,
    "",
  );
  const api = wrapAxiosWithPayment(
    axios.create({ baseURL: base, timeout: 90_000 }),
    client,
  );
  const q = "How do I renew Egypt national ID while living abroad?";
  console.log(JSON.stringify({ base, payer: account.address, q }));
  const started = Date.now();
  const res = await api.get("/ask", { params: { q } });
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
      { status: res.status, latencyMs: Date.now() - started, payment, data: res.data },
      null,
      2,
    ),
  );
  if (res.status !== 200) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
