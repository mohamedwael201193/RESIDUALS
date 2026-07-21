import {
  createWalletClient,
  createPublicClient,
  http,
  parseAbi,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { env } from "./env.js";

const abi = parseAbi([
  "function credit(address[] contributors, uint256[] amounts)",
  "function claimable(address account) view returns (uint256)",
  "function withdraw()",
]);

function xLayerChain(rpc: string) {
  return {
    id: 196,
    name: "X Layer",
    nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
    rpcUrls: { default: { http: [rpc] } },
  } as const;
}

export async function creditVault(
  contributors: string[],
  amounts: bigint[],
): Promise<string> {
  const e = env();
  const vault = e.RESIDUALS_VAULT_ADDRESS as Address | undefined;
  if (!vault) throw new Error("RESIDUALS_VAULT_ADDRESS not set");

  const chain = xLayerChain(e.XLAYER_RPC_URL);
  const account = privateKeyToAccount(e.OPERATOR_PRIVATE_KEY as Hex);
  const publicClient = createPublicClient({
    chain,
    transport: http(e.XLAYER_RPC_URL),
  });
  const wallet = createWalletClient({
    account,
    chain,
    transport: http(e.XLAYER_RPC_URL),
  });

  const hash = await wallet.writeContract({
    address: vault,
    abi,
    functionName: "credit",
    args: [contributors as Address[], amounts],
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}
