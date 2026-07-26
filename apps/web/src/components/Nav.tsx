import { List, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Magnetic } from "./motion";
import { Button, cx } from "./ui";

const links = [
  { to: "/how-it-works", label: "How it works" },
  { to: "/ask", label: "Ask" },
  { to: "/contribute", label: "Contribute" },
  { to: "/ledger", label: "Ledger" },
  { to: "/docs", label: "Docs" },
];

export function Nav({ overHero = false }: { overHero?: boolean }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-[10]">
      <div className="mx-auto max-w-[1400px] px-4 pt-3 md:px-6 md:pt-4">
        <div
          className={cx(
            "glass-panel flex h-14 items-center justify-between rounded-full border-hairline px-4 md:h-16 md:px-6",
            overHero && "bg-black/35",
          )}
        >
          <Link to="/" className="text-base font-semibold tracking-tight md:text-lg">
            RESIDUALS
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-ink-muted lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cx("transition hover:text-ink", isActive && "text-ink")
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Magnetic>
              <NavLink to="/ask">
                <Button variant="amber">Try a sample</Button>
              </NavLink>
            </Magnetic>
          </div>

          <button
            type="button"
            className="rounded-full p-2 text-ink lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <List size={22} />}
          </button>
        </div>

        {open ? (
          <div className="glass-panel mt-2 rounded-3xl border border-hairline p-5 lg:hidden">
            <div className="flex flex-col gap-4 text-sm">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="text-ink-muted hover:text-ink"
                >
                  {l.label}
                </NavLink>
              ))}
              <NavLink to="/ask" onClick={() => setOpen(false)}>
                <Button variant="amber" className="w-full">
                  Try a sample
                </Button>
              </NavLink>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
