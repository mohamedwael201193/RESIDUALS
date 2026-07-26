import { ArrowUpRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { Reveal } from "./motion";

const product = [
  { to: "/ask", label: "Ask" },
  { to: "/contribute", label: "Contribute" },
  { to: "/ledger", label: "Ledger" },
  { to: "/withdraw", label: "Withdraw" },
];

const company = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/docs", label: "Docs" },
  { to: "/about", label: "About" },
];

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-8 md:py-36">
        <Reveal>
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="text-lg font-semibold tracking-tight">RESIDUALS</p>
              <p className="mt-4 max-w-md text-ink-muted">
                An A2MCP agent that answers from a human corpus and shares query fees
                with the people whose knowledge was retrieved.
              </p>
              <a
                href="https://residuals-api.onrender.com/health"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-1 text-sm text-amber hover:text-amber-soft"
              >
                Live API health
                <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="md:col-span-3">
              <p className="text-sm font-medium text-ink">Product</p>
              <ul className="mt-4 space-y-2 text-sm text-ink-muted">
                {product.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-ink">Company</p>
              <ul className="mt-4 space-y-2 text-sm text-ink-muted">
                {company.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-ink">Network</p>
              <ul className="mt-4 space-y-2 text-sm text-ink-muted">
                <li>X Layer · USD₮0</li>
                <li>OKX.AI A2MCP</li>
                <li>x402 on /ask</li>
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="mt-24 max-w-5xl text-4xl font-semibold tracking-tight text-ink md:mt-32 md:text-6xl lg:text-7xl lg:leading-[0.95]">
            Pay the humans who actually know.
          </p>
          <p className="mt-8 text-sm text-ink-muted">
            © {new Date().getFullYear()} RESIDUALS · Agent #9374
          </p>
        </Reveal>
      </div>
    </footer>
  );
}
