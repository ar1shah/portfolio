"use client";

import { useEffect, useRef, useState } from "react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import type { NavItem } from "./nav";

/**
 * Below sm the wordmark plus four nav items will not fit a 375px header,
 * so the links collapse behind this. Same interaction contract as the photo
 * lightbox: scroll lock, Tab trap, Esc to close, focus back to the trigger.
 */
export function MobileMenu({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll(open);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;

    // Land the keyboard on the first link rather than leaving it on the
    // trigger behind the panel.
    panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="sm:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        className="chrome border border-rule px-3 py-2 text-ink-dim transition-colors duration-200 hover:border-ink-dim hover:text-ink"
      >
        {open ? "close" : "menu"}
      </button>

      {open && (
        <>
          {/* Covers the page below the header so a tap outside dismisses. */}
          <div
            className="fixed inset-x-0 bottom-0 top-20 z-30 bg-ground/80"
            onClick={close}
            aria-hidden
          />

          <div
            id="mobile-nav"
            ref={panelRef}
            className="fixed inset-x-0 top-20 z-40 border-y border-rule bg-ground animate-rise"
          >
            <ul className="shell flex flex-col py-2">
              {items.map((item, i) => (
                <li key={item.href} className="border-b border-rule last:border-0">
                  <a
                    href={item.href}
                    onClick={close}
                    className="flex items-baseline gap-4 py-4"
                  >
                    <span className="chrome text-accent">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="chrome text-ink">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
