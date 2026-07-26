import { RoyaltyLedger } from "../components/RoyaltyLedger";
import { Reveal } from "../components/motion";
import { SiteShell } from "../components/SiteShell";

export function LedgerPage() {
  return (
    <SiteShell>
      <section className="px-5 pb-24 pt-32 md:px-8 md:pb-32 md:pt-36">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Ledger</h1>
            <p className="mt-4 max-w-2xl text-ink-muted">
              Inspect recent queries, fees, and royalty accruals from the live API.
            </p>
          </Reveal>
          <div className="mt-10">
            <RoyaltyLedger />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
