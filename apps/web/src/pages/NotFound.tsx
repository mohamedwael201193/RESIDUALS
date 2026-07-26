import { Link } from "react-router-dom";
import { SiteShell } from "../components/SiteShell";
import { Button } from "../components/ui";

export function NotFound() {
  return (
    <SiteShell>
      <section className="flex min-h-[70dvh] flex-col items-start justify-center px-5 pt-28 md:px-8">
        <div className="mx-auto w-full max-w-[1100px]">
          <p className="font-mono text-sm text-amber">404</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight md:text-6xl">
            This route is not in the corpus.
          </h1>
          <p className="mt-5 max-w-lg text-ink-muted">
            The page you asked for does not exist. Head home or try a free sample ask.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/">
              <Button variant="amber">Home</Button>
            </Link>
            <Link to="/ask">
              <Button variant="secondary">Try a sample</Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
