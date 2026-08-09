"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cls } from "@/lib/format";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import {
  IconBook,
  IconCalc,
  IconChat,
  IconEye,
  IconHome,
  IconMarkets,
  IconMore,
  IconWallet,
  IconX,
} from "./icons";

const ITEMS = [
  { href: "/", label: "Accueil", icon: IconHome },
  { href: "/marches", label: "Marchés", icon: IconMarkets },
  { href: "/portefeuille", label: "Portefeuille", icon: IconWallet },
  { href: "/simulateur", label: "Simulateur", icon: IconCalc },
  { href: "/watchlist", label: "Watchlist", icon: IconEye },
  { href: "/apprendre", label: "Apprendre", icon: IconBook },
  { href: "/assistant", label: "Copilote IA", icon: IconChat },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SideNav() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-panel px-4 py-5 md:flex">
      <Link href="/" aria-label="Accueil Invest Copilote">
        <Logo withTagline />
      </Link>
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cls(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
              isActive(pathname, href)
                ? "bg-panel2 text-ink"
                : "text-ink2 hover:bg-panel2/60 hover:text-ink",
            )}
          >
            <Icon className={cls("h-4.5 w-4.5", isActive(pathname, href) ? "text-brand3" : "")} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center justify-between border-t border-line pt-4">
        <span className="text-[11px] text-ink3">v0.1 · MVP</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}

const MOBILE_MAIN = ITEMS.slice(0, 3);
const MOBILE_MORE = ITEMS.slice(3);

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const copilote = ITEMS[6];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
      {open && (
        <div className="fixed right-3 bottom-20 left-3 z-50 rounded-xl border border-line bg-panel p-2 shadow-xl md:hidden">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-semibold text-ink3 uppercase">Plus</span>
            <button onClick={() => setOpen(false)} aria-label="Fermer" className="p-1 text-ink3">
              <IconX className="h-4 w-4" />
            </button>
          </div>
          {MOBILE_MORE.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cls(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium",
                isActive(pathname, href) ? "bg-panel2 text-ink" : "text-ink2",
              )}
            >
              <Icon className="h-4.5 w-4.5 text-brand3" />
              {label}
            </Link>
          ))}
        </div>
      )}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-panel/95 backdrop-blur md:hidden">
        {[...MOBILE_MAIN, copilote].map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cls(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
              isActive(pathname, href) ? "text-brand3" : "text-ink3",
            )}
          >
            <Icon className="h-5 w-5" />
            {label === "Copilote IA" ? "Copilote" : label}
          </Link>
        ))}
        <button
          onClick={() => setOpen((v) => !v)}
          className={cls(
            "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
            MOBILE_MORE.some((i) => isActive(pathname, i.href)) ? "text-brand3" : "text-ink3",
          )}
          aria-label="Plus de pages"
        >
          <IconMore className="h-5 w-5" />
          Plus
        </button>
      </nav>
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-2.5 backdrop-blur md:hidden">
        <Link href="/" aria-label="Accueil Invest Copilote">
          <Logo compact />
        </Link>
        <ThemeToggle />
      </header>
    </>
  );
}
