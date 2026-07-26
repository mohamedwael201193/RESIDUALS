/**
 * Fund a fresh EOA from OPERATOR and run one paid /ask (unlocks distinct_payers >= 2).
 */
import { appendFileSync, readFileSync, writeFileSync } from "fs";
import axios from "axios";
import {
  wrapAxiosWithPayment,
  decodePaymentResponseHeader,
  x402Client,
} from "@okxweb3/x402-axios";
import { registerExactEvmScheme } from "@okxweb3/x402-evm/exact/client";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  formatUnits,
  http,
  parseUnits,
} from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { loadEnv, env } from "../env.js";

const erc20 = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "a", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

async function main() {
  loadEnv();
  const e = env();
  const rpc = e.XLAYER_RPC_URL;
  const usdt = e.USDT0_ADDRESS as `0x${string}`;
  const xlayer = defineChain({
    id: 196,
    name: "X Layer",
    nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
    rpcUrls: { default: { http: [rpc] } },
  });

  const op = privateKeyToAccount(e.OPERATOR_PRIVATE_KEY as `0x${string}`);
  const secondPk = generatePrivateKey();
  const second = privateKeyToAccount(secondPk);
  const pub = createPublicClient({ chain: xlayer, transport: http(rpc) });
  const wallet = createWalletClient({
    account: op,
    chain: xlayer,
    transport: http(rpc),
  });

  console.log(
    JSON.stringify({ second: second.address, fundingFrom: op.address }),
  );

  const okbHash = await wallet.sendTransaction({
    to: second.address,
    value: parseUnits("0.003", 18),
  });
  await pub.waitForTransactionReceipt({ hash: okbHash });
  const usdtHash = await wallet.writeContract({
    address: usdt,
    abi: erc20,
    functionName: "transfer",
    args: [second.address, parseUnits("0.08", 6)],
  });
  await pub.waitForTransactionReceipt({ hash: usdtHash });

  const okbBal = await pub.getBalance({ address: second.address });
  const usdtBal = await pub.readContract({
    address: usdt,
    abi: erc20,
    functionName: "balanceOf",
    args: [second.address],
  });
  console.log(
    JSON.stringify({
      funded: true,
      okbHash,
      usdtHash,
      okb: formatUnits(okbBal, 18),
      usdt0: formatUnits(usdtBal, 6),
    }),
  );

  let envText = readFileSync(".env", "utf8");
  if (!envText.includes("SECOND_PAYER_PRIVATE_KEY=")) {
    appendFileSync(
      ".env",
      `\n# Second payer for anti-farm / royalty unlock (EOA)\nSECOND_PAYER_PRIVATE_KEY=${secondPk}\nSECOND_PAYER_ADDRESS=${second.address}\n`,
    );
  } else {
    envText = envText
      .replace(/SECOND_PAYER_PRIVATE_KEY=.*/g, `SECOND_PAYER_PRIVATE_KEY=${secondPk}`)
      .replace(/SECOND_PAYER_ADDRESS=.*/g, `SECOND_PAYER_ADDRESS=${second.address}`);
    writeFileSync(".env", envText);
  }

  const client = new x402Client();
  registerExactEvmScheme(client, {
    signer: second,
    networks: ["eip155:196"],
    schemeOptions: { rpcUrl: rpc },
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
