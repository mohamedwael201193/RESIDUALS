import type { Request } from "express";

const QUERY_KEYS = ["q", "query", "question", "prompt", "text", "message"] as const;

function pickFromRecord(obj: unknown): string {
  if (!obj || typeof obj !== "object") return "";
  const rec = obj as Record<string, unknown>;

  for (const key of QUERY_KEYS) {
    const direct = rec[key];
    if (typeof direct === "string" && direct.trim()) return direct.trim();
  }

  for (const [key, value] of Object.entries(rec)) {
    if (
      QUERY_KEYS.includes(key.toLowerCase() as (typeof QUERY_KEYS)[number]) &&
      typeof value === "string" &&
      value.trim()
    ) {
      return value.trim();
    }
  }

  // Nested shapes some buyers send: { input: { query } }, { data: { q } }
  for (const nestKey of ["input", "data", "params", "body"]) {
    const nested = pickFromRecord(rec[nestKey]);
    if (nested) return nested;
  }

  return "";
}

/**
 * Resolve the ask/sample question from GET querystring or POST body.
 * Accepts q / query / question (and a few aliases) for JSON and form bodies.
 */
export function extractQuery(req: Request): string {
  return pickFromRecord(req.query) || pickFromRecord(req.body) || "";
}
