import type {
  AskResult,
  Citation,
  ContributorStats,
  HealthResponse,
  LedgerItem,
  LedgerResponse,
} from "./types";

function asRecord(v: unknown): Record<string, unknown> {
  return v !== null && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) {
    return Number(v);
  }
  return fallback;
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function bool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

export function normalizeCitation(raw: unknown): Citation {
  const o = asRecord(raw);
  const citation: Citation = {
    entryId: num(o.entryId ?? o.entry_id ?? o.id),
    handle: str(o.handle ?? o.author ?? o.contributor_handle, "contributor"),
  };
  const topic = str(o.topic);
  if (topic) citation.topic = topic;
  if (o.score !== undefined) citation.score = num(o.score);
  if (o.micros !== undefined || o.amount_micros !== undefined) {
    citation.micros = num(o.micros ?? o.amount_micros);
  }
  const snippet = str(o.snippet ?? o.excerpt);
  if (snippet) citation.snippet = snippet;
  const contributor = str(o.contributor ?? o.address);
  if (contributor) citation.contributor = contributor;
  return citation;
}

export function normalizeAsk(raw: unknown): AskResult {
  const o = asRecord(raw);
  const citationsRaw = o.citations ?? o.entries ?? o.sources;
  const result: AskResult = {
    answer: str(o.answer ?? o.text ?? o.result, ""),
    citations: Array.isArray(citationsRaw) ? citationsRaw.map(normalizeCitation) : [],
  };
  if (o.charged !== undefined) result.charged = bool(o.charged);
  if (o.queryId !== undefined || o.query_id !== undefined) {
    result.queryId = num(o.queryId ?? o.query_id);
  }
  const message = str(o.message);
  if (message) result.message = message;
  return result;
}

export function normalizeLedgerItem(raw: unknown): LedgerItem {
  const o = asRecord(raw);
  const citationsRaw = o.citations ?? o.accruals ?? o.splits;
  return {
    id: num(o.id ?? o.query_id),
    query: str(o.query ?? o.q ?? o.prompt, ""),
    paidMicros: num(o.paidMicros ?? o.paid_micros ?? o.amount_micros),
    charged: bool(o.charged, true),
    createdAt: str(o.createdAt ?? o.created_at, new Date(0).toISOString()),
    citations: Array.isArray(citationsRaw) ? citationsRaw.map(normalizeCitation) : [],
  };
}

export function normalizeLedger(raw: unknown, limit: number, offset: number): LedgerResponse {
  const o = asRecord(raw);
  const list = o.items ?? o.data ?? o.rows ?? o.queries;
  const items = Array.isArray(list) ? list.map(normalizeLedgerItem) : [];
  const response: LedgerResponse = {
    items,
    limit: num(o.limit, limit),
    offset: num(o.offset, offset),
  };
  if (o.total !== undefined) response.total = num(o.total);
  return response;
}

export function normalizeContributor(raw: unknown, address: string): ContributorStats {
  const o = asRecord(raw);
  const stats: ContributorStats = {
    address: str(o.address, address).toLowerCase(),
    accruedMicros: num(o.accruedMicros ?? o.accrued_micros ?? o.accrued),
    settledMicros: num(o.settledMicros ?? o.settled_micros ?? o.settled),
    withdrawableMicros: num(
      o.withdrawableMicros ?? o.withdrawable_micros ?? o.withdrawable ?? o.claimable,
    ),
  };
  const handle = str(o.handle);
  if (handle) stats.handle = handle;
  if (o.entryCount !== undefined || o.entry_count !== undefined) {
    stats.entryCount = num(o.entryCount ?? o.entry_count);
  }
  return stats;
}

export function normalizeHealth(raw: unknown): HealthResponse {
  const o = asRecord(raw);
  const deps = asRecord(o.dependencies ?? o.deps);
  const health: HealthResponse = {
    ...o,
    ok: bool(o.ok ?? o.healthy, false),
  };
  if (o.db !== undefined) health.db = bool(o.db);
  else if (deps.db !== undefined) health.db = bool(deps.db);
  if (o.embeddings !== undefined) health.embeddings = bool(o.embeddings);
  else if (deps.embeddings !== undefined) health.embeddings = bool(deps.embeddings);
  if (o.queryCount !== undefined || o.query_count !== undefined) {
    health.queryCount = num(o.queryCount ?? o.query_count);
  }
  if (o.entryCount !== undefined || o.entry_count !== undefined) {
    health.entryCount = num(o.entryCount ?? o.entry_count);
  }
  if (o.contributorCount !== undefined || o.contributor_count !== undefined) {
    health.contributorCount = num(o.contributorCount ?? o.contributor_count);
  }
  const timestamp = str(o.timestamp ?? o.ts);
  if (timestamp) health.timestamp = timestamp;
  return health;
}
