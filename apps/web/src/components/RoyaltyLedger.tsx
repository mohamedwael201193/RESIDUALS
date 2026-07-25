import { ArrowClockwise, CurrencyDollar } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { ApiError, getLedger } from "../lib/api";
import { formatMicrosDelta } from "../lib/money";
import type { LedgerItem } from "../lib/types";
import { Button, Panel, Skeleton, StateBlock } from "./ui";

export function RoyaltyLedger({ limit = 20 }: { limit?: number }) {
  const [items, setItems] = useState<LedgerItem[]>([]);
  const [total, setTotal] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLedger(limit, 0);
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load ledger");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Panel>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Royalty ledger
          </h2>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            Live public audit of queries and contributor splits. Amounts shown in USD
            from integer micros.
            {total !== undefined ? ` ${total} recorded.` : ""}
          </p>
        </div>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          <ArrowClockwise size={16} className={loading ? "animate-spin" : undefined} />
          Refresh
        </Button>
      </div>

      <div className="mt-8 space-y-3">
        {loading ? (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : null}

        {!loading && error ? (
          <StateBlock title="Could not load ledger" body={error} />
        ) : null}

        {!loading && !error && items.length === 0 ? (
          <StateBlock
            title="Ledger is empty"
            body="Paid queries will appear here once agents call /ask and royalties accrue."
          />
        ) : null}

        {!loading &&
          !error &&
          items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-hairline px-4 py-4 md:px-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-ink-muted">
                    #{item.id}
                    {item.createdAt
                      ? ` · ${new Date(item.createdAt).toLocaleString()}`
                      : ""}
                    {item.charged ? "" : " · not charged"}
                  </p>
                  <p className="mt-1 font-medium leading-snug">{item.query || "(no query text)"}</p>
                </div>
                <p className="inline-flex items-center gap-1 text-sm font-medium text-amber">
                  <CurrencyDollar size={16} weight="bold" />
                  {formatMicrosDelta(item.paidMicros)}
                </p>
              </div>
              {item.citations.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {item.citations.map((c) => (
                    <li
                      key={`${item.id}-${c.entryId}-${c.handle}`}
                      className="rounded-full bg-surface-muted px-3 py-1 text-xs text-ink-muted"
                    >
                      {c.handle}
                      {c.micros !== undefined ? ` · ${formatMicrosDelta(c.micros)}` : ""}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
      </div>
    </Panel>
  );
}
