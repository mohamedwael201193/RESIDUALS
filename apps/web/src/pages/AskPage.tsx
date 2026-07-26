import { AskDemo } from "../components/AskDemo";
import { Reveal } from "../components/motion";
import { SiteShell } from "../components/SiteShell";

export function AskPage() {
  return (
    <SiteShell>
      <section className="px-5 pb-24 pt-32 md:px-8 md:pb-32 md:pt-36">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Ask</h1>
            <p className="mt-4 max-w-2xl text-ink-muted">
              Sample is free. Paid Ask settles via x402 and accrues royalties to cited
              contributors. Product logic and API contracts are unchanged.
            </p>
          </Reveal>
          <div className="mt-10">
            <AskDemo defaultMode="sample" />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
