import { formatUsdDisplay } from "@residuals/shared";

export function formatMicros(micros: number | bigint | undefined | null): string {
  if (micros === undefined || micros === null) return "$0.00";
  try {
    return formatUsdDisplay(typeof micros === "number" ? micros : micros);
  } catch {
    return "$0.00";
  }
}

export function formatMicrosDelta(micros: number | bigint): string {
  const n = typeof micros === "bigint" ? Number(micros) : micros;
  const formatted = formatMicros(Math.abs(n));
  if (n > 0) return `+${formatted}`;
  if (n < 0) return `-${formatted.replace("$", "")}`;
  return formatted;
}
