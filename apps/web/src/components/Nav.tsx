import { List, X } from "@phosphor-icons/react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button, cx } from "./ui";

const links = [
  { to: "/#how", label: "How it works" },
  { to: "/#ledger", label: "Ledger" },
  { to: "/app", label: "Product" },
];

export function Nav({ overHero = false }: { overHero?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cx(
        "absolute inset-x-0 top-0 z-40",
        overHero ? "text-white" : "text-ink",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-[72px] md:px-8">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          RESIDUALS
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className="opacity-80 transition hover:opacity-100"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <NavLink to="/app">
            <Button variant={overHero ? "onDark" : "primary"}>Try a sample</Button>
          </NavLink>
        </div>

        <button
          type="button"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <List size={24} />}
        </button>
      </div>

      {open ? (
        <div
          className={cx(
            "border-t px-5 py-4 md:hidden",
            overHero
              ? "border-white/15 bg-ink/90 backdrop-blur"
              : "border-hairline bg-canvas",
          )}
        >
          <div className="flex flex-col gap-4 text-sm">
            {links.map((l) => (
              <a key={l.to} href={l.to} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <NavLink to="/app" onClick={() => setOpen(false)}>
              <Button variant={overHero ? "onDark" : "primary"} className="w-full">
                Try a sample
              </Button>
            </NavLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
