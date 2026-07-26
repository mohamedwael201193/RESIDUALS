import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const Landing = lazy(() =>
  import("./pages/Landing").then((m) => ({ default: m.Landing })),
);
const HowItWorks = lazy(() =>
  import("./pages/HowItWorks").then((m) => ({ default: m.HowItWorks })),
);
const AskPage = lazy(() =>
  import("./pages/AskPage").then((m) => ({ default: m.AskPage })),
);
const ContributePage = lazy(() =>
  import("./pages/ContributePage").then((m) => ({ default: m.ContributePage })),
);
const LedgerPage = lazy(() =>
  import("./pages/LedgerPage").then((m) => ({ default: m.LedgerPage })),
);
const WithdrawPage = lazy(() =>
  import("./pages/WithdrawPage").then((m) => ({ default: m.WithdrawPage })),
);
const DocsPage = lazy(() =>
  import("./pages/DocsPage").then((m) => ({ default: m.DocsPage })),
);
const AboutPage = lazy(() =>
  import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })),
);
const AppShell = lazy(() =>
  import("./pages/AppShell").then((m) => ({ default: m.AppShell })),
);
const NotFound = lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFound })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-canvas text-ink-muted">
      <div className="h-10 w-40 animate-pulse rounded-full bg-surface-2" aria-label="Loading" />
    </div>
  );
}

export function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/ask" element={<AskPage />} />
        <Route path="/contribute" element={<ContributePage />} />
        <Route path="/ledger" element={<LedgerPage />} />
        <Route path="/withdraw" element={<WithdrawPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/app" element={<AppShell />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
