import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { PageFade } from "./motion";
import { Nav } from "./Nav";

export function SiteShell({
  children,
  overHero = false,
}: {
  children: ReactNode;
  overHero?: boolean;
}) {
  return (
    <div className="grain ambient-mesh min-h-[100dvh] overflow-x-hidden text-ink">
      <Nav overHero={overHero} />
      <PageFade>
        <main className="w-full max-w-full">{children}</main>
      </PageFade>
      <Footer />
    </div>
  );
}
