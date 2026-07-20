import { env } from "./env.js";
import { log } from "./log.js";
import type { RetrievedEntry } from "./retrieval.js";

function deterministicCompose(q: string, entries: RetrievedEntry[]): string {
  const parts = entries.map((e, i) => {
    const region = e.region ? ` (${e.region})` : "";
    return `${i + 1}. [${e.topic}${region}] ${e.body.trim()}`;
  });
  return [
    `Practical answer for: "${q.trim()}"`,
    "",
    "Drawn only from contributor knowledge:",
    "",
    ...parts,
    "",
    "Informational only. Verify with the official source before acting.",
  ].join("\n");
}

async function llmPhrase(
  q: string,
  entries: RetrievedEntry[],
): Promise<string | null> {
  const e = env();
  const cascade: Array<{ name: string; url: string; key: string; model: string }> =
    [];

  if (e.CEREBRAS_API_KEY) {
    cascade.push({
      name: "cerebras",
      url: "https://api.cerebras.ai/v1/chat/completions",
      key: e.CEREBRAS_API_KEY,
      model: e.CEREBRAS_MODEL,
    });
  }
  if (e.GROQ_API_KEY) {
    cascade.push({
      name: "groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: e.GROQ_API_KEY,
      model: e.GROQ_MODEL || "llama-3.3-70b-versatile",
    });
  }
  if (e.OPENROUTER_API_KEY) {
    cascade.push({
      name: "openrouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: e.OPENROUTER_API_KEY,
      model: e.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
    });
  }
  if (e.TOGETHER_API_KEY) {
    cascade.push({
      name: "together",
      url: "https://api.together.xyz/v1/chat/completions",
      key: e.TOGETHER_API_KEY,
      model: e.TOGETHER_MODEL || "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
    });
  }

  const corpus = entries
    .map((x, i) => `ENTRY ${i + 1} (id=${x.id}):\n${x.body}`)
    .join("\n\n");

  const system =
    "You rewrite practical advice using ONLY the provided ENTRY blocks. Do not invent facts, offices, forms, or steps. If something is missing, say so. Keep under 350 words. End with: Informational only. Verify with the official source before acting.";

  for (const provider of cascade) {
    try {
      const ctrl = AbortSignal.timeout(e.LLM_TIMEOUT_MS);
      const res = await fetch(provider.url, {
        method: "POST",
        signal: ctrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.key}`,
        },
        body: JSON.stringify({
          model: provider.model,
          temperature: 0.2,
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: `Question: ${q}\n\n${corpus}\n\nWrite the answer.`,
            },
          ],
        }),
      });
      if (!res.ok) continue;
      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) continue;
      // Post-check: must contain a fragment from at least one entry
      const hit = entries.some((en) => {
        const snippet = en.body.slice(0, 40).trim();
        return snippet.length > 10 && text.includes(snippet.slice(0, 24));
      });
      if (!hit && !entries.some((en) => text.toLowerCase().includes(en.topic.toLowerCase()))) {
        log.warn({ provider: provider.name }, "llm output failed post-check");
        continue;
      }
      return text;
    } catch (err) {
      log.warn({ err, provider: provider.name }, "llm provider failed");
    }
  }
  return null;
}

export async function composeAnswer(
  q: string,
  entries: RetrievedEntry[],
): Promise<string> {
  if (entries.length === 0) {
    return "No contributor knowledge covers this yet. Contribute a specific, actionable write-up and it can earn a published share of future query fees when retrieved.";
  }
  const phrased = await llmPhrase(q, entries);
  return phrased ?? deterministicCompose(q, entries);
}

export function composeSample(
  q: string,
  entries: RetrievedEntry[],
): string {
  if (entries.length === 0) {
    return "No contributor knowledge covers this yet.";
  }
  const top = entries[0]!;
  return [
    `Sample (free, shortened) for: "${q.trim()}"`,
    "",
    top.body.slice(0, 400) + (top.body.length > 400 ? "…" : ""),
    "",
    "Full answers via paid /ask share fees with cited contributors.",
  ].join("\n");
}
