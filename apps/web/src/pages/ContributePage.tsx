import { ContributeForm } from "../components/ContributeForm";
import { Reveal } from "../components/motion";
import { SiteShell } from "../components/SiteShell";

export function ContributePage() {
  return (
    <SiteShell>
      <section className="px-5 pb-24 pt-32 md:px-8 md:pb-32 md:pt-36">
        <div className="mx-auto max-w-[1100px]">
          <Reveal>
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Contribute</h1>
            <p className="mt-4 max-w-2xl text-ink-muted">
              Publish practical knowledge tied to a wallet. When your entry is cited on a paid
              ask, royalties accrue toward ResidualsVault.
            </p>
          </Reveal>
          <div className="mt-10">
            <ContributeForm />
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
