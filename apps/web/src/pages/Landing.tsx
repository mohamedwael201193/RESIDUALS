import { ArrowRight, Coins, Path, UsersThree } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FlowDiagram } from "../components/FlowDiagram";
import { Magnetic, Reveal, StaggerWords } from "../components/motion";
import { SiteShell } from "../components/SiteShell";
import { StoryPin } from "../components/StoryPin";
import { Button } from "../components/ui";
import { getHealth, getLedger } from "../lib/api";
import { formatMicros } from "../lib/money";
import type { HealthResponse } from "../lib/types";

const trustMarks = ["OKX.AI", "X Layer", "USD₮0", "x402", "A2MCP"];

export function Landing() {
  const reduce = useReducedMotion();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [ledgerCount, setLedgerCount] = useState<number | null>(null);
  const [paidMicros, setPaidMicros] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getHealth()
      .then((h) => {
        if (!cancelled) setHealth(h);
      })
      .catch(() => {
        if (!cancelled) setHealth(null);
      });
    void getLedger(50, 0)
      .then((ledger) => {
        if (cancelled) return;
        setLedgerCount(ledger.total ?? ledger.items.length);
        const sum = ledger.items.reduce(
          (acc, row) => acc + (row.charged ? row.paidMicros : 0),
          0,
        );
        setPaidMicros(sum);
      })
      .catch(() => {
        if (!cancelled) {
          setLedgerCount(null);
          setPaidMicros(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteShell overHero>
      <section className="relative min-h-[100dvh] overflow-hidden pt-20">
        <img
          src="/hero-reeded.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_20%,rgba(196,138,58,0.22),transparent_45%),linear-gradient(180deg,rgba(7,7,8,0.55)_0%,rgba(7,7,8,0.72)_50%,rgba(7,7,8,0.96)_100%)]"
          aria-hidden
        />
        {!reduce ? (
          <motion.div
            className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-amber/20 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 24, 0], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
        ) : null}

        <div className="relative z-10 mx-auto grid min-h-[100dvh] max-w-[1400px] items-center gap-12 px-5 pb-20 pt-10 md:grid-cols-12 md:px-8 md:pt-6">
          <div className="md:col-span-7 lg:col-span-6">
            <StaggerWords
              text="Pay the humans who actually know."
              className="max-w-5xl text-4xl font-semibold tracking-tight text-ink md:text-5xl lg:text-[3.4rem] lg:leading-[1.05]"
            />
            <motion.p
              className="mt-6 max-w-xl text-base text-ink-muted md:text-lg"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              Every paid query shares fees with contributors whose answers were retrieved.
            </motion.p>
            <motion.div
              className="mt-10 flex flex-wrap items-center gap-3"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Magnetic>
                <Link to="/ask">
                  <Button variant="amber">
                    Try a sample
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </Magnetic>
              <Link to="/how-it-works">
                <Button variant="secondary">See the flow</Button>
              </Link>
            </motion.div>
          </div>

          <div className="md:col-span-5 lg:col-span-6">
            <Reveal>
              <div className="glass-panel overflow-hidden rounded-[28px] p-5 md:p-7">
                <p className="font-mono text-[11px] tracking-[0.14em] text-amber">
                  LIVE ROYALTY PATH
                </p>
                <FlowDiagram className="mt-6" />
                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-hairline pt-5 text-center">
                  <div>
                    <p className="font-mono text-xs text-ink-muted">Fee</p>
                    <p className="mt-1 text-sm font-medium">0.03 USD₮0</p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-ink-muted">Agent</p>
                    <p className="mt-1 text-sm font-medium">#9374</p>
                  </div>
                  <div>
                    <p className="font-mono text-xs text-ink-muted">Chain</p>
                    <p className="mt-1 text-sm font-medium">X Layer</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-hairline bg-surface/40 py-8">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-6 px-5 md:px-8">
          {trustMarks.map((m) => (
            <span key={m} className="font-mono text-xs tracking-[0.16em] text-ink-muted">
              {m}
            </span>
          ))}
        </div>
      </section>

      <StoryPin />

      <section className="px-5 py-24 md:px-8 md:py-40">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
              One query. A full settlement path.
            </h2>
            <p className="mt-5 max-w-2xl text-ink-muted">
              Sample for free. Pay once for a settled ask. Cited humans accrue royalties into
              ResidualsVault.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-flow-dense gap-4 md:grid-cols-6 md:grid-rows-2">
            <Reveal className="glass-panel rounded-[28px] p-7 md:col-span-3 md:row-span-2">
              <Path size={28} className="text-amber" weight="duotone" />
              <h3 className="mt-6 text-2xl font-semibold tracking-tight">Retrieve + cite</h3>
              <p className="mt-3 max-w-md text-ink-muted">
                Embeddings find the human entries that actually answer the how-to. Citations
                drive the split, not vibes.
              </p>
              <img
                src="/brandkit.png"
                alt="RESIDUALS brand system"
                className="mt-8 aspect-[4/3] w-full rounded-2xl object-cover opacity-90"
              />
            </Reveal>
            <Reveal delay={0.06} className="glass-panel rounded-[28px] p-7 md:col-span-3">
              <Coins size={28} className="text-amber" weight="duotone" />
              <h3 className="mt-5 text-xl font-semibold">x402 settle</h3>
              <p className="mt-2 text-sm text-ink-muted">
                Paid `/ask` settles 0.03 USD₮0 on X Layer before the answer returns.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="glass-panel rounded-[28px] p-7 md:col-span-3">
              <UsersThree size={28} className="text-amber" weight="duotone" />
              <h3 className="mt-5 text-xl font-semibold">Vault + withdraw</h3>
              <p className="mt-2 text-sm text-ink-muted">
                Cron sweeps accruals on-chain. Contributors withdraw when balances clear.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-hairline bg-surface-muted px-5 py-24 md:px-8 md:py-36">
        <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-3">
          {[
            {
              label: "API",
              value: health?.ok ? "Online" : health === null ? "Checking" : "Degraded",
            },
            {
              label: "Ledger rows",
              value: ledgerCount === null ? "—" : String(ledgerCount),
            },
            {
              label: "Recent paid volume",
              value: paidMicros === null ? "—" : formatMicros(paidMicros),
            },
          ].map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.06}>
              <p className="font-mono text-xs tracking-[0.14em] text-ink-muted">{stat.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{stat.value}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 py-24 md:px-8 md:py-40">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
              Start with a free sample. Publish what you know.
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="flex flex-wrap gap-3">
              <Link to="/ask">
                <Button variant="amber">Open Ask</Button>
              </Link>
              <Link to="/contribute">
                <Button variant="secondary">Contribute</Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
