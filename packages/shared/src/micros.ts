/** Integer micros (6 decimals). Never use floats for money. */

export const MICROS_PER_USD = 1_000_000n;

export function usdToMicros(usd: number | string): bigint {
  const s = typeof usd === "number" ? usd.toFixed(6) : usd;
  const [whole = "0", frac = ""] = s.split(".");
  const fracPadded = (frac + "000000").slice(0, 6);
  const sign = whole.startsWith("-") ? -1n : 1n;
  const w = BigInt(whole.replace("-", "") || "0");
  const f = BigInt(fracPadded);
  return sign * (w * MICROS_PER_USD + f);
}

export function microsToUsdString(micros: bigint | number): string {
  const m = typeof micros === "number" ? BigInt(micros) : micros;
  const neg = m < 0n;
  const abs = neg ? -m : m;
  const whole = abs / MICROS_PER_USD;
  const frac = abs % MICROS_PER_USD;
  const fracStr = frac.toString().padStart(6, "0").replace(/0+$/, "") || "0";
  const body = fracStr === "0" ? whole.toString() : `${whole}.${fracStr}`;
  return neg ? `-${body}` : body;
}

export function formatUsdDisplay(micros: bigint | number): string {
  const s = microsToUsdString(micros);
  const n = Number(s);
  if (!Number.isFinite(n)) return `$${s}`;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(n);
}
