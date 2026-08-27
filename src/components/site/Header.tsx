"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AsciiWordmark } from "./AsciiWordmark";

const NAV = [
  { href: "/#work", label: "work" },
  { href: "/#experience", label: "experience" },
  { href: "/#stack", label: "stack" },
];

export function Header() {
  // The rule is absent at rest and appears once the page moves. A border
  // that is always there reads as a toolbar; this reads as the page.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-ground/95 transition-[border-color] duration-300 border-b ${
        scrolled ? "border-rule" : "border-transparent"
      }`}
    >
      <div className="shell flex items-center justify-between h-16">
        <Link
          href="/"
          className="shrink-0 hover:opacity-70 transition-opacity duration-200"
        >
          <AsciiWordmark variant="header" />
        </Link>

        <nav aria-label="Primary">
          <ul className="flex items-center gap-6 sm:gap-8">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="chrome text-ink-dim hover:text-ink transition-colors duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
