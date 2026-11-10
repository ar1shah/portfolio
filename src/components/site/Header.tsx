"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AsciiWordmark } from "./AsciiWordmark";
import { MobileMenu } from "./MobileMenu";
import { NAV, NAV_IDS } from "./nav";
import { useActiveSection } from "@/hooks/useActiveSection";

export function Header() {
  // The rule is absent at rest and appears once the page moves. A border
  // that is always there reads as a toolbar; this reads as the page.
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const section = useActiveSection(NAV_IDS);

  // The spy answers with a home-page section id no matter where you are —
  // it falls back to the first id when nothing matches. Off the home page
  // that is simply wrong, so the pathname decides instead. (This is also
  // why /projects/<slug> used to underline "about".)
  const onHome = pathname === "/";

  const isActive = (item: (typeof NAV)[number]) =>
    item.id
      ? onHome && section === item.id
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

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
      <div className="shell flex items-center justify-between h-20">
        <Link
          href="/"
          className="shrink-0 hover:opacity-70 transition-opacity duration-200"
        >
          <AsciiWordmark variant="header" />
        </Link>

        <nav aria-label="Primary" className="hidden sm:block">
          <ul className="flex items-center gap-6 md:gap-8">
            {NAV.map((item) => {
              const active = isActive(item);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "true" : undefined}
                    className={`chrome relative block py-1 transition-colors duration-200 ${
                      active ? "text-ink" : "text-ink-dim hover:text-ink"
                    }`}
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className={`absolute -bottom-0.5 left-0 h-px bg-accent transition-[width] duration-300 ease-out ${
                        active ? "w-full" : "w-0"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <MobileMenu items={NAV} />
      </div>
    </header>
  );
}
