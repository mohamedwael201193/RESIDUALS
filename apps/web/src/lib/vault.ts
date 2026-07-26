import type { Abi } from "viem";
import { vaultAddress } from "./env";

/** Minimal ResidualsVault surface for claimable + withdraw. */
export const residualsVaultAbi = [
  {
    type: "function",
    name: "claimable",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
] as const satisfies Abi;

export function getVaultAddress(): `0x${string}` | undefined {
  return vaultAddress();
}
