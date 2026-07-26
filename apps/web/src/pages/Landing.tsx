import { ArrowRight, Coins, Path, UsersThree } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Nav } from "../components/Nav";
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
        const sum = ledger.items.reduce((acc, row) => acc + (row.charged ? row.paidMicros : 0), 0);
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

  const fade = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  const inView = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div className="bg-canvas text-ink">
      <section className="relative min-h-[100dvh] overflow-hidden text-white">
        <img
          src="/hero-reeded.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.45)_45%,rgba(0,0,0,0.72)_100%)]"
          aria-hidden
        />
        <Nav overHero />

        <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[980px] flex-col items-center justify-center px-5 pb-16 pt-20 text-center md:px-8">
          <motion.h1
            className="text-5xl font-semibold tracking-tight md:text-7xl lg:text-[5.5rem] lg:leading-[0.95]"
            {...fade(0)}
          >
            RESIDUALS
          </motion.h1>
          <motion.p
            className="mt-5 max-w-3xl text-balance text-2xl font-medium tracking-tight text-white md:text-4xl md:leading-[1.15]"
            {...fade(0.08)}
          >
            Pay the humans who actually know.
          </motion.p>
          <motion.p
            className="mt-6 max-w-xl text-base text-white/80 md:text-lg"
            {...fade(0.16)}
          >
            Every paid query shares fees with contributors whose answers were retrieved.
          </motion.p>
          <motion.div className="mt-10 flex flex-wrap items-center justify-center gap-3" {...fade(0.24)}>
            <Link to="/app">
              <Button variant="onDark">
                Try a sample
                <ArrowRight size={16} weight="bold" />
              </Button>
            </Link>
            <a href="#contribute">
              <Button variant="onDarkGhost">Contribute</Button>
            </a>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-hairline bg-surface-muted py-10 md:py-12">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-10 gap-y-4 px-5 md:px-8">
          {trustMarks.map((mark) => (
            <span
              key={mark}
              className="text-sm font-medium tracking-wide text-ink/45 md:text-base"
            >
              {mark}
            </span>
          ))}
        </div>
      </section>

      <section id="how" className="scroll-mt-20 bg-canvas py-32 md:py-40">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8">
          <motion.div {...inView} className="max-w-3xl">
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Knowledge with a payout path
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-ink-muted">
              Agents ask. RESIDUALS retrieves human-written entries, cites who helped, and
              accrues USD₮0 royalties off-chain before batch settlement on X Layer.
            </p>
          </motion.div>

          <div className="mt-20 grid gap-10 md:grid-cols-3 md:gap-12">
            {[
              {
                icon: Path,
                title: "Retrieve with receipts",
                body: "Answers are composed from ranked corpus entries. Citations name the contributor, not a faceless model.",
              },
              {
                icon: Coins,
                title: "Split the query fee",
                body: "Half of each paid ask is shared by relevance. Integer micros only. The public ledger shows every split.",
              },
              {
                icon: UsersThree,
                title: "Withdraw yourself",
                body: "Settled balances land in ResidualsVault. Contributors connect a wallet and call withdraw().",
              },
            ].map((item, i) => (
              <motion.div key={item.title} {...inView} transition={{ delay: reduce ? 0 : i * 0.08 }}>
                <item.icon size={28} className="text-amber" weight="duotone" />
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-3 text-ink-muted">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink py-32 text-white md:py-40">
        <div className="mx-auto grid max-w-[1400px] items-center gap-16 px-5 md:grid-cols-2 md:px-8">
          <motion.div {...inView}>
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Built for agents that pay
            </h2>
            <p className="mt-6 max-w-lg text-lg text-white/70">
              Unpaid GET /ask returns 402 with an x402 challenge. Free GET /sample lets
              judges preview retrieval without settlement.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/app">
                <Button variant="onDark">Open product</Button>
              </Link>
              <a href="#ledger">
                <Button variant="onDarkGhost">View ledger</Button>
              </a>
            </div>
          </motion.div>

          <motion.div
            {...inView}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur"
          >
            <p className="text-sm text-white/50">Live status</p>
            <dl className="mt-6 space-y-5">
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-white/60">API health</dt>
                <dd className="font-medium">
                  {health ? (health.ok ? "OK" : "Degraded") : "Unavailable"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-white/60">Database</dt>
                <dd className="font-medium">
                  {health?.db === undefined ? "n/a" : health.db ? "Up" : "Down"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-white/60">Embeddings</dt>
                <dd className="font-medium">
                  {health?.embeddings === undefined
                    ? "n/a"
                    : health.embeddings
                      ? "Up"
                      : "Down"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-4">
                <dt className="text-white/60">Ledger rows (live)</dt>
                <dd className="font-medium">
                  {ledgerCount === null ? "n/a" : ledgerCount.toLocaleString()}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-white/60">Paid volume in latest page</dt>
                <dd className="font-medium text-amber-soft">
                  {paidMicros === null ? "n/a" : formatMicros(paidMicros)}
                </dd>
              </div>
            </dl>
            <p className="mt-6 text-xs text-white/40">
              Figures load from GET /health and GET /ledger. Empty means the API is offline
              or the corpus is new.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="ledger" className="scroll-mt-20 bg-canvas py-32 md:py-40">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8">
          <motion.div {...inView} className="max-w-3xl">
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
              A public royalty trail
            </h2>
            <p className="mt-6 max-w-2xl text-lg text-ink-muted">
              Every charged query writes an immutable audit row. Open the product shell to
              watch citations and dollar amounts update from the live API.
            </p>
          </motion.div>
          <motion.div {...inView} className="mt-14">
            <Link to="/app#ledger">
              <Button>
                Open royalty ledger
                <ArrowRight size={16} weight="bold" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <section id="contribute" className="scroll-mt-20 bg-ink py-32 text-white md:py-40">
        <div className="mx-auto max-w-[1400px] px-5 text-center md:px-8">
          <motion.div {...inView}>
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Contribute once. Earn when retrieved.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
              Publish concrete how-to knowledge. When an agent pays for an answer that uses
              your entry, your share accrues automatically.
            </p>
            <div className="mt-10">
              <Link to="/app#contribute">
                <Button variant="onDark">Contribute</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
