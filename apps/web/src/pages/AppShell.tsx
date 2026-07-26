import { Link } from "react-router-dom";
import { AskDemo } from "../components/AskDemo";
import { ContributeForm } from "../components/ContributeForm";
import { RoyaltyLedger } from "../components/RoyaltyLedger";
import { WithdrawPanel } from "../components/WithdrawPanel";
import { Reveal } from "../components/motion";
import { SiteShell } from "../components/SiteShell";
import { Button } from "../components/ui";

const tabs = [
  { href: "#sample", label: "Ask" },
  { href: "#ledger", label: "Ledger" },
  { href: "#contribute", label: "Contribute" },
  { href: "#withdraw", label: "Withdraw" },
];

export function AppShell() {
  return (
    <SiteShell>
      <section className="px-5 pb-10 pt-32 md:px-8 md:pt-36">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Product</h1>
                <p className="mt-4 max-w-2xl text-ink-muted">
                  Sample answers, inspect the royalty ledger, publish knowledge, and withdraw
                  settled USD₮0 on X Layer. All panels call the live API.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tabs.map((t) => (
                  <a
                    key={t.href}
                    href={t.href}
                    className="rounded-full border border-hairline px-4 py-2 text-sm text-ink-muted transition hover:border-amber/50 hover:text-ink"
                  >
                    {t.label}
                  </a>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <main className="mx-auto max-w-[1100px] space-y-10 px-5 pb-24 md:px-8 md:pb-32">
        <section id="sample" className="scroll-mt-28">
          <AskDemo defaultMode="sample" />
        </section>
        <section id="ledger" className="scroll-mt-28">
          <RoyaltyLedger />
        </section>
        <section id="contribute" className="scroll-mt-28">
          <ContributeForm />
        </section>
        <section id="withdraw" className="scroll-mt-28">
          <WithdrawPanel />
        </section>
        <div className="flex flex-wrap gap-3 pt-4">
          <Link to="/docs">
            <Button variant="secondary">Docs</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost">Marketing site</Button>
          </Link>
        </div>
      </main>
    </SiteShell>
  );
}
