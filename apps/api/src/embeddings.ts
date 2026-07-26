import { env } from "./env.js";
import { log } from "./log.js";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    t = setTimeout(() => reject(new Error(`embeddings timeout after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    if (t) clearTimeout(t);
  }
}

async function geminiEmbed(text: string): Promise<number[]> {
  const e = env();
  const model = e.EMBEDDINGS_MODEL.replace(/^models\//, "");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${e.EMBEDDINGS_API_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: `models/${model}`,
      content: { parts: [{ text }] },
      outputDimensionality: e.EMBEDDINGS_DIMENSIONS,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`gemini embeddings ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    embedding?: { values?: number[] };
  };
  const values = json.embedding?.values;
  if (!values?.length) throw new Error("gemini embeddings: empty vector");
  return values;
}

/** OpenRouter OpenAI-compatible embeddings (fallback when Gemini quota is exhausted). */
async function openrouterEmbed(text: string): Promise<number[]> {
  const e = env();
  const key = e.OPENROUTER_API_KEY;
  if (!key) throw new Error("openrouter embeddings: OPENROUTER_API_KEY missing");
  const model = e.EMBEDDINGS_MODEL.includes("/")
    ? e.EMBEDDINGS_MODEL
    : `google/${e.EMBEDDINGS_MODEL.replace(/^models\//, "")}`;
  const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": e.PUBLIC_BASE_URL || "https://residuals-api.onrender.com",
      "X-Title": "RESIDUALS",
    },
    body: JSON.stringify({
      model,
      input: text,
      dimensions: e.EMBEDDINGS_DIMENSIONS,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`openrouter embeddings ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    data?: Array<{ embedding?: number[] }>;
  };
  const values = json.data?.[0]?.embedding;
  if (!values?.length) throw new Error("openrouter embeddings: empty vector");
  return values;
}

function isQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /\b429\b|quota|rate limit/i.test(msg);
}

export async function embed(text: string): Promise<number[]> {
  const e = env();
  const input = text.trim().slice(0, 8000);
  if (!input) throw new Error("embed: empty text");

  const provider = (e.EMBEDDINGS_PROVIDER || "gemini").toLowerCase();
  const primary =
    provider === "openrouter" ? openrouterEmbed : geminiEmbed;
  const fallback =
    provider === "openrouter"
      ? e.EMBEDDINGS_API_KEY
        ? geminiEmbed
        : null
      : e.OPENROUTER_API_KEY
        ? openrouterEmbed
        : null;

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const values = await withTimeout(primary(input), e.EMBEDDINGS_TIMEOUT_MS);
      if (values.length !== e.EMBEDDINGS_DIMENSIONS) {
        throw new Error(
          `embedding dim ${values.length} != expected ${e.EMBEDDINGS_DIMENSIONS}`,
        );
      }
      return values;
    } catch (err) {
      lastErr = err;
      log.warn({ err, attempt, provider }, "embed primary failed");
      if (fallback && isQuotaError(err)) {
        try {
          const values = await withTimeout(
            fallback(input),
            e.EMBEDDINGS_TIMEOUT_MS,
          );
          if (values.length !== e.EMBEDDINGS_DIMENSIONS) {
            throw new Error(
              `embedding dim ${values.length} != expected ${e.EMBEDDINGS_DIMENSIONS}`,
            );
          }
          log.info({ provider: "fallback" }, "embed via fallback provider");
          return values;
        } catch (fbErr) {
          lastErr = fbErr;
          log.warn({ err: fbErr }, "embed fallback failed");
        }
      }
      await sleep(50 + Math.floor(Math.random() * 150));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export function toPgVector(values: number[]): string {
  return `[${values.join(",")}]`;
}
