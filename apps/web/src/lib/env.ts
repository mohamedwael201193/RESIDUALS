function trimSlash(v: string): string {
  return v.replace(/\/+$/, "");
}

/** API origin. Empty → same-origin `/api` (Vite proxy → localhost:3000). */
export function apiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (raw) return trimSlash(raw);
  return "/api";
}

export function vaultAddress(): `0x${string}` | undefined {
  const v = import.meta.env.VITE_VAULT_ADDRESS?.trim();
  if (v && /^0x[a-fA-F0-9]{40}$/.test(v)) return v as `0x${string}`;
  return undefined;
}

export function chainId(): number {
  const raw = import.meta.env.VITE_CHAIN_ID?.trim();
  const n = raw ? Number(raw) : 196;
  return Number.isFinite(n) ? n : 196;
}

export function usdt0Address(): `0x${string}` {
  const v = import.meta.env.VITE_USDT0_ADDRESS?.trim();
  if (v && /^0x[a-fA-F0-9]{40}$/.test(v)) return v as `0x${string}`;
  return "0x779Ded0c9e1022225f8E0630b35a9b54bE713736";
}
