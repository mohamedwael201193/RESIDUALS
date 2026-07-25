import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-8 md:py-28">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-lg font-semibold tracking-tight">RESIDUALS</p>
            <p className="mt-4 max-w-md text-ink-muted">
              An A2MCP agent that answers from a human corpus and shares query fees
              with the people whose knowledge was retrieved.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Product</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              <li>
                <Link to="/app" className="hover:text-ink">
                  Open app
                </Link>
              </li>
              <li>
                <a href="/#how" className="hover:text-ink">
                  How it works
                </a>
              </li>
              <li>
                <a href="/#contribute" className="hover:text-ink">
                  Contribute
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Network</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              <li>X Layer · USD₮0</li>
              <li>OKX.AI A2MCP</li>
              <li>x402 paywall on /ask</li>
            </ul>
          </div>
        </div>

        <p className="mt-20 text-4xl font-semibold tracking-tight text-ink md:mt-28 md:text-6xl lg:text-7xl">
          Pay the humans who actually know.
        </p>
        <p className="mt-8 text-sm text-ink-muted">© {new Date().getFullYear()} RESIDUALS</p>
      </div>
    </footer>
  );
}
