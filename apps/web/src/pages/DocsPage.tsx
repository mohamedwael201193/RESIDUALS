import { ArrowUpRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { Reveal } from "../components/motion";
import { SiteShell } from "../components/SiteShell";

const endpoints = [
  { method: "GET", path: "/health", note: "Liveness. Add ?deep=1 for embedding probe." },
  { method: "GET", path: "/sample?q=", note: "Free preview answer from the corpus." },
  { method: "GET", path: "/ask?q=", note: "Paid answer. Requires x402 settlement (0.03 USD₮0)." },
  { method: "POST", path: "/contribute", note: "Publish a knowledge entry with wallet + body." },
  { method: "GET", path: "/ledger", note: "Recent query + royalty rows." },
  { method: "GET", path: "/contributor/:address", note: "Contributor accruals and status." },
];

export function DocsPage() {
  return (
    <SiteShell>
      <section className="px-5 pb-24 pt-32 md:px-8 md:pb-32 md:pt-36">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Docs</h1>
            <p className="mt-4 max-w-2xl text-ink-muted">
              Production API surface for agents and the web app. Full architecture lives in
              SOURCE_OF_TRUTH.md in the repository.
            </p>
            <a
              href="https://residuals-api.onrender.com/health"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-1 text-amber hover:text-amber-soft"
            >
              https://residuals-api.onrender.com
              <ArrowUpRight size={16} />
            </a>
          </Reveal>

          <div className="mt-14 space-y-3">
            {endpoints.map((e, i) => (
              <Reveal key={e.path} delay={i * 0.04}>
                <div className="glass-panel flex flex-col gap-2 rounded-2xl px-5 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3 font-mono text-sm">
                    <span className="text-amber">{e.method}</span>
                    <span className="text-ink">{e.path}</span>
                  </div>
                  <p className="text-sm text-ink-muted">{e.note}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="mt-16 grid gap-4 md:grid-cols-2">
              <Link
                to="/how-it-works"
                className="glass-panel rounded-2xl p-6 transition hover:border-amber/40"
              >
                <p className="text-lg font-semibold">How it works</p>
                <p className="mt-2 text-sm text-ink-muted">Story of retrieval, payment, vault.</p>
              </Link>
              <Link
                to="/about"
                className="glass-panel rounded-2xl p-6 transition hover:border-amber/40"
              >
                <p className="text-lg font-semibold">About</p>
                <p className="mt-2 text-sm text-ink-muted">Mission, network, agent identity.</p>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
