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

export async function embed(text: string): Promise<number[]> {
  const e = env();
  const input = text.trim().slice(0, 8000);
  if (!input) throw new Error("embed: empty text");

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const values = await withTimeout(
        e.EMBEDDINGS_PROVIDER === "gemini"
          ? geminiEmbed(input)
          : geminiEmbed(input),
        e.EMBEDDINGS_TIMEOUT_MS,
      );
      if (values.length !== e.EMBEDDINGS_DIMENSIONS) {
        throw new Error(
          `embedding dim ${values.length} != expected ${e.EMBEDDINGS_DIMENSIONS}`,
        );
      }
      return values;
    } catch (err) {
      lastErr = err;
      log.warn({ err, attempt }, "embed failed");
      await sleep(50 + Math.floor(Math.random() * 150));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

export function toPgVector(values: number[]): string {
  return `[${values.join(",")}]`;
}
