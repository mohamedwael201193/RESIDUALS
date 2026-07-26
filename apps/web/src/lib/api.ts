import { apiBase } from "./env";
import {
  normalizeAsk,
  normalizeContributor,
  normalizeHealth,
  normalizeLedger,
} from "./normalize";
import type {
  AskResult,
  ContributeBody,
  ContributeResult,
  ContributorStats,
  HealthResponse,
  LedgerResponse,
} from "./types";
import { ApiError } from "./types";

function url(path: string, params?: Record<string, string | number | undefined>): string {
  const base = apiBase();
  const u = new URL(
    path.startsWith("/") ? `${base}${path}` : `${base}/${path}`,
    typeof window !== "undefined" ? window.location.origin : "http://localhost",
  );
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== "") u.searchParams.set(k, String(v));
    }
  }
  if (base.startsWith("http")) return u.toString();
  return `${u.pathname}${u.search}`;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function messageFromBody(body: unknown, fallback: string): string {
  if (typeof body === "string" && body.trim()) return body;
  if (body && typeof body === "object") {
    const o = body as Record<string, unknown>;
    if (typeof o.error === "string") return o.error;
    if (typeof o.message === "string") return o.message;
  }
  return fallback;
}

async function request(
  path: string,
  init?: RequestInit & { params?: Record<string, string | number | undefined> },
): Promise<unknown> {
  const { params, ...rest } = init ?? {};
  const res = await fetch(url(path, params), {
    ...rest,
    headers: {
      Accept: "application/json",
      ...(rest.body ? { "Content-Type": "application/json" } : {}),
      ...rest.headers,
    },
  });
  const body = await parseBody(res);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      messageFromBody(body, res.status === 402 ? "Payment required" : `Request failed (${res.status})`),
      body,
    );
  }
  return body;
}

export async function getHealth(): Promise<HealthResponse> {
  const body = await request("/health");
  return normalizeHealth(body);
}

export async function getSample(q: string): Promise<AskResult> {
  const body = await request("/sample", { params: { q } });
  return normalizeAsk(body);
}

export async function getAsk(q: string): Promise<AskResult> {
  const body = await request("/ask", { params: { q } });
  return normalizeAsk(body);
}

export async function getLedger(limit = 20, offset = 0): Promise<LedgerResponse> {
  const body = await request("/ledger", { params: { limit, offset } });
  return normalizeLedger(body, limit, offset);
}

export async function postContribute(payload: ContributeBody): Promise<ContributeResult> {
  const body = await request("/contribute", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const o = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const result: ContributeResult = {
    id: Number(o.id ?? o.entryId ?? o.entry_id ?? 0),
  };
  if (typeof o.status === "string") result.status = o.status;
  if (typeof o.handle === "string") result.handle = o.handle;
  if (typeof o.topic === "string") result.topic = o.topic;
  return result;
}

export async function getContributor(address: string): Promise<ContributorStats> {
  const body = await request(`/contributor/${encodeURIComponent(address)}`);
  return normalizeContributor(body, address);
}

export { ApiError };
