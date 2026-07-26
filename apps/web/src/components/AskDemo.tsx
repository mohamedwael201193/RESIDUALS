import { ArrowRight, CirclesThreePlus, WarningCircle } from "@phosphor-icons/react";
import { useState } from "react";
import { ApiError, getAsk, getSample } from "../lib/api";
import type { AskResult } from "../lib/types";
import { Button, Field, Input, Panel, Skeleton, StateBlock } from "./ui";

type Mode = "sample" | "ask";

export function AskDemo({
  id,
  defaultMode = "sample",
}: {
  id?: string;
  defaultMode?: Mode;
}) {
  const [q, setQ] = useState("How do I open a business bank account in Singapore?");
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState(false);
  const [result, setResult] = useState<AskResult | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) {
      setError("Enter a question.");
      return;
    }
    setLoading(true);
    setError(null);
    setPaywall(false);
    setResult(null);
    try {
      const data = mode === "sample" ? await getSample(query) : await getAsk(query);
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError && err.paymentRequired) {
        setPaywall(true);
        setError(
          "Paid /ask requires x402 settlement (0.03 USD₮0). Use Sample for a free preview, or call /ask with a paying agent wallet.",
        );
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : "Request failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel id={id} className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Ask</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Sample is free. Paid Ask settles via x402 and accrues royalties to cited
            contributors.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-hairline p-1 text-sm">
          <button
            type="button"
            className={`rounded-full px-4 py-2 transition ${
              mode === "sample" ? "bg-amber text-ink-inverse" : "text-ink-muted"
            }`}
            onClick={() => setMode("sample")}
          >
            Sample
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-2 transition ${
              mode === "ask" ? "bg-amber text-ink-inverse" : "text-ink-muted"
            }`}
            onClick={() => setMode("ask")}
          >
            Paid ask
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Question" hint="Practical how-to questions work best.">
          <Input
            id="ask-question"
            name="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ask something practical..."
            disabled={loading}
          />
        </Field>
        <Button type="submit" disabled={loading} className="min-w-40">
          {loading ? "Retrieving…" : mode === "sample" ? "Try a sample" : "Call /ask"}
          {!loading ? <ArrowRight size={16} weight="bold" /> : null}
        </Button>
      </form>

      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : null}

        {error ? (
          <div
            className={`flex gap-3 rounded-xl border px-4 py-4 text-sm ${
              paywall
                ? "border-amber/40 bg-amber/10 text-ink"
                : "border-hairline bg-surface-muted text-ink"
            }`}
            role="alert"
          >
            <WarningCircle size={20} className="mt-0.5 shrink-0 text-amber" weight="fill" />
            <div>
              <p className="font-medium">{paywall ? "Payment required" : "Request error"}</p>
              <p className="mt-1 text-ink-muted">{error}</p>
            </div>
          </div>
        ) : null}

        {!loading && !error && !result ? (
          <StateBlock
            title="No answer yet"
            body="Submit a question to retrieve contributor knowledge from the live API."
          />
        ) : null}

        {result ? (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-ink-muted">Answer</p>
              <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-ink">
                {result.answer || result.message || "No coverage for this query yet."}
              </p>
            </div>
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink-muted">
                <CirclesThreePlus size={16} className="text-amber" />
                Citations
              </div>
              {result.citations.length === 0 ? (
                <StateBlock
                  title="No citations returned"
                  body="The API answered without linked entries, or relevance was below threshold."
                />
              ) : (
                <ul className="space-y-3">
                  {result.citations.map((c) => (
                    <li
                      key={`${c.entryId}-${c.handle}`}
                      className="rounded-xl border border-hairline px-4 py-3"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-medium">
                          {c.handle}
                          {c.topic ? (
                            <span className="font-normal text-ink-muted"> · {c.topic}</span>
                          ) : null}
                        </p>
                        <p className="text-xs text-ink-muted">
                          entry #{c.entryId}
                          {c.score !== undefined ? ` · score ${c.score.toFixed(2)}` : ""}
                        </p>
                      </div>
                      {c.snippet ? (
                        <p className="mt-2 text-sm text-ink-muted">{c.snippet}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  );
}
