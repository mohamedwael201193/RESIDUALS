import { Link } from "react-router-dom";
import { AskDemo } from "../components/AskDemo";
import { ContributeForm } from "../components/ContributeForm";
import { RoyaltyLedger } from "../components/RoyaltyLedger";
import { WithdrawPanel } from "../components/WithdrawPanel";
import { Button } from "../components/ui";

const tabs = [
  { href: "#sample", label: "Ask" },
  { href: "#ledger", label: "Ledger" },
  { href: "#contribute", label: "Contribute" },
  { href: "#withdraw", label: "Withdraw" },
];

export function AppShell() {
  return (
    <div className="min-h-[100dvh] bg-surface-muted text-ink">
      <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between gap-4 px-5 md:h-[72px] md:px-8">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg font-semibold tracking-tight">
              RESIDUALS
            </Link>
            <nav className="hidden items-center gap-5 text-sm text-ink-muted md:flex">
              {tabs.map((t) => (
                <a key={t.href} href={t.href} className="hover:text-ink">
                  {t.label}
                </a>
              ))}
            </nav>
          </div>
          <Link to="/">
            <Button variant="secondary">Marketing site</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] space-y-10 px-5 py-10 md:px-8 md:py-14">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Product</h1>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Sample answers, inspect the royalty ledger, publish knowledge, and withdraw
            settled USD₮0 on X Layer. All panels call the live API.
          </p>
        </div>

        <section id="sample" className="scroll-mt-24">
          <AskDemo defaultMode="sample" />
        </section>

        <section id="ledger" className="scroll-mt-24">
          <RoyaltyLedger />
        </section>

        <section id="contribute" className="scroll-mt-24">
          <ContributeForm />
        </section>

        <section id="withdraw" className="scroll-mt-24">
          <WithdrawPanel />
        </section>
      </main>
    </div>
  );
}
