import { ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { FlowDiagram } from "../components/FlowDiagram";
import { Reveal } from "../components/motion";
import { SiteShell } from "../components/SiteShell";
import { Button } from "../components/ui";

const stages = [
  {
    title: "Contribute knowledge",
    body: "Publish practical how-to entries with a wallet address. Entries embed into the corpus for retrieval.",
  },
  {
    title: "Ask (sample or paid)",
    body: "Sample previews for free. Paid `/ask` settles 0.03 USD₮0 via x402 on X Layer before the answer returns.",
  },
  {
    title: "Retrieve + cite",
    body: "Vector search finds matching human entries. Cited contributors become royalty recipients for that query.",
  },
  {
    title: "Accrue royalties",
    body: "A published share of the fee accrues off-chain per citation. Anti-farm rules require distinct payers.",
  },
  {
    title: "Sweep to vault",
    body: "A cron job credits ResidualsVault on X Layer in batches so contributors can withdraw USD₮0.",
  },
  {
    title: "Withdraw",
    body: "Connect a wallet matching your contributor address and withdraw settled balance from the vault.",
  },
];

export function HowItWorks() {
  return (
    <SiteShell>
      <section className="px-5 pb-20 pt-32 md:px-8 md:pb-28 md:pt-36">
        <div className="mx-auto max-w-[1400px]">
          <Reveal>
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl md:leading-[1.05]">
              From human knowledge to withdrawable USD₮0.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-ink-muted">
              RESIDUALS is an A2MCP agent. Answers come from people. Fees flow back when those
              people get cited.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="glass-panel mt-14 rounded-[28px] p-6 md:p-10">
              <FlowDiagram />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-hairline px-5 py-24 md:px-8 md:py-36">
        <div className="mx-auto max-w-[1100px] space-y-0">
          {stages.map((s, idx) => (
            <Reveal key={s.title} delay={idx * 0.04}>
              <div className="border-b border-hairline py-10">
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{s.title}</h2>
                <p className="mt-3 max-w-2xl text-ink-muted">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 pb-28 md:px-8">
        <div className="mx-auto flex max-w-[1400px] flex-wrap gap-3">
          <Link to="/ask">
            <Button variant="amber">
              Try Ask
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link to="/docs">
            <Button variant="secondary">Read docs</Button>
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
