export * from "./micros.js";
export * from "./royalties.js";

export const QUERY_PRICE_USD_DEFAULT = "0.03";
export const NETWORK_XLAYER = "eip155:196" as const;
export const USDT0_XLAYER = "0x779Ded0c9e1022225f8E0630b35a9b54bE713736" as const;

export function isEthAddress(v: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(v);
}

export function normalizeAddress(v: string): string {
  return v.toLowerCase();
}
