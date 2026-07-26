/**
 * Unpaid input-contract matrix (Tanjiro checklist) against PUBLIC_BASE_URL.
 */
import { loadEnv, env } from "../env.js";

const Q = "How do I open a business bank account in Singapore for a freelancing LLC?";

async function hit(
  label: string,
  init: { path: string; method?: string; headers?: Record<string, string>; body?: string },
) {
  const base = (env().PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
  const opts: RequestInit = { method: init.method ?? "GET" };
  if (init.headers) opts.headers = init.headers;
  if (init.body !== undefined) opts.body = init.body;
  const r = await fetch(`${base}${init.path}`, opts);
  const text = await r.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  const pr = r.headers.get("payment-required");
  let challenge: Record<string, unknown> | null = null;
  if (pr) {
    try {
      challenge = JSON.parse(Buffer.from(pr, "base64").toString("utf8")) as Record<
        string,
        unknown
      >;
    } catch {
      /* ignore */
    }
  }
  const accepts = (challenge?.accepts as Array<Record<string, unknown>> | undefined)?.[0];
  console.log(
    JSON.stringify({
      label,
      status: r.status,
      error: json?.error ?? null,
      hasAnswer: typeof json?.answer === "string" && String(json.answer).length > 20,
      network: accepts?.network ?? null,
      amount: accepts?.amount ?? null,
      asset: accepts?.asset ?? null,
      payTo: accepts?.payTo ?? null,
      scheme: accepts?.scheme ?? null,
    }),
  );
  return { status: r.status, json, accepts };
}

async function main() {
  loadEnv();
  const results = [];
  results.push(
    await hit("GET /sample?q=", {
      path: `/sample?q=${encodeURIComponent(Q)}`,
    }),
  );
  results.push(
    await hit("POST /sample JSON q", {
      path: "/sample",
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: Q }),
    }),
  );
  results.push(
    await hit("POST /sample JSON query", {
      path: "/sample",
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: Q }),
    }),
  );
  results.push(
    await hit("POST /sample JSON question", {
      path: "/sample",
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question: Q }),
    }),
  );
  results.push(
    await hit("POST /sample form q", {
      path: "/sample",
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `q=${encodeURIComponent(Q)}`,
    }),
  );
  results.push(
    await hit("POST /sample form query", {
      path: "/sample",
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `query=${encodeURIComponent(Q)}`,
    }),
  );
  results.push(
    await hit("GET /ask?q=", {
      path: `/ask?q=${encodeURIComponent(Q)}`,
    }),
  );
  results.push(
    await hit("POST /ask JSON q", {
      path: "/ask",
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: Q }),
    }),
  );
  results.push(
    await hit("POST /ask JSON query", {
      path: "/ask",
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: Q }),
    }),
  );
  results.push(
    await hit("POST /ask form query", {
      path: "/ask",
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: `query=${encodeURIComponent(Q)}`,
    }),
  );
  results.push(
    await hit("GET /sample tie", {
      path: `/sample?q=${encodeURIComponent("how to tie a tie")}`,
    }),
  );

  const sampleOk = results
    .filter((r, i) => i < 6)
    .every((r) => r.status === 200 && r.json && typeof r.json.answer === "string");
  const ask402 = results
    .slice(6, 10)
    .every(
      (r) =>
        r.status === 402 &&
        r.accepts?.network === "eip155:196" &&
        String(r.accepts?.asset || "").toLowerCase() ===
          "0x779ded0c9e1022225f8e0630b35a9b54be713736" &&
        r.accepts?.amount === "30000",
    );
  const tie = results[10];
  const tieTopic = Array.isArray(tie?.json?.citations)
    ? String((tie!.json!.citations as Array<{ topic?: string }>)[0]?.topic ?? "")
    : "";
  const tieOk =
    tie?.status === 200 &&
    (tieTopic.toLowerCase().includes("tie") ||
      String(tie?.json?.answer ?? "")
        .toLowerCase()
        .includes("no contributor knowledge"));

  console.log(JSON.stringify({ sampleOk, ask402, tieOk, tieTopic }, null, 2));
  if (!sampleOk || !ask402) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
