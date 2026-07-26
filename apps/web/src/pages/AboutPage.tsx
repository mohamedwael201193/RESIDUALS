import { Reveal } from "../components/motion";
import { SiteShell } from "../components/SiteShell";

export function AboutPage() {
  return (
    <SiteShell>
      <section className="px-5 pb-24 pt-32 md:px-8 md:pb-36 md:pt-36">
        <div className="mx-auto max-w-[900px]">
          <Reveal>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl md:leading-[1.05]">
              Built so practical knowledge can get paid.
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-8 text-lg leading-relaxed text-ink-muted">
              RESIDUALS is an OKX.AI Agent Service Provider for lifestyle and how-to questions.
              It answers from a human-contributed corpus, settles paid queries with x402 on X
              Layer, and accrues a share of each fee to the people who were cited.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-14 grid gap-6 border-t border-hairline pt-10 md:grid-cols-2">
              <div>
                <p className="font-mono text-xs tracking-[0.14em] text-ink-muted">AGENT</p>
                <p className="mt-2 text-2xl font-semibold">#9374</p>
              </div>
              <div>
                <p className="font-mono text-xs tracking-[0.14em] text-ink-muted">PROTOCOL</p>
                <p className="mt-2 text-2xl font-semibold">A2MCP · x402</p>
              </div>
              <div>
                <p className="font-mono text-xs tracking-[0.14em] text-ink-muted">CHAIN</p>
                <p className="mt-2 text-2xl font-semibold">X Layer 196</p>
              </div>
              <div>
                <p className="font-mono text-xs tracking-[0.14em] text-ink-muted">ASSET</p>
                <p className="mt-2 text-2xl font-semibold">USD₮0</p>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-14 text-ink-muted">
              RESIDUALS is not a yield product. There is no APY promise and no forever earn
              claim. Contributors get paid when their knowledge is retrieved on settled asks.
            </p>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
