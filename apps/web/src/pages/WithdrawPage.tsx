import { WithdrawPanel } from "../components/WithdrawPanel";
import { Reveal } from "../components/motion";
import { SiteShell } from "../components/SiteShell";

export function WithdrawPage() {
  return (
    <SiteShell>
      <section className="px-5 pb-24 pt-32 md:px-8 md:pb-32 md:pt-36">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Withdraw</h1>
            <p className="mt-4 max-w-2xl text-ink-muted">
              Connect the wallet that matches your contributor address and withdraw settled
              USD₮0 from ResidualsVault on X Layer.
            </p>
          </Reveal>
          <div className="mt-10">
            <WithdrawPanel />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
