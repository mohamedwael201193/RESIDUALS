import { QueryClient } from "@tanstack/react-query";
import { http, createConfig, createStorage } from "wagmi";
import { injected } from "wagmi/connectors";
import { defineChain } from "viem";
import { chainId } from "./env";

const id = chainId();

export const xLayer = defineChain({
  id,
  name: id === 196 ? "X Layer" : `X Layer (${id})`,
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        id === 1952
          ? "https://testrpc.xlayer.tech/terigon"
          : "https://rpc.xlayer.tech",
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "OKLink",
      url:
        id === 1952
          ? "https://www.okx.com/web3/explorer/xlayer-testnet"
          : "https://www.okx.com/web3/explorer/xlayer",
    },
  },
});

export const wagmiConfig = createConfig({
  chains: [xLayer],
  connectors: [injected({ shimDisconnect: true })],
  transports: {
    [xLayer.id]: http(),
  },
  storage: createStorage({ storage: localStorage }),
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function explorerTxUrl(hash: string): string {
  return `${xLayer.blockExplorers.default.url}/tx/${hash}`;
}

export function shortAddress(addr: string): string {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
