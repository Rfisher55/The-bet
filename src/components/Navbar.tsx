"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/teams", label: "Teams" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-green flex items-center justify-center text-white font-bold text-sm glow-pulse">
            TB
          </div>
          <span className="font-display text-xl tracking-widest text-white group-hover:text-primary transition-colors">
            THE BET
          </span>
          <span className="hidden sm:inline-block text-xs text-muted border border-border rounded px-1.5 py-0.5 ml-1">
            D1 CFB
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Season badge */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-muted">2026 Season</span>
        </div>
      </div>
    </nav>
  );
}
