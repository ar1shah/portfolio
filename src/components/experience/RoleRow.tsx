"use client";

import { useId, useState } from "react";
import type { Role } from "@/content/experience";

export function RoleRow({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <li className="grid gap-x-10 gap-y-4 border-t border-rule py-8 sm:grid-cols-[9rem_1fr]">
      <div className="flex flex-col gap-1">
        <span className="chrome text-ink-dim whitespace-nowrap">
          {role.start} — {role.end}
        </span>
        {role.kind === "education" && (
          <span className="chrome text-ink-dim">education</span>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="group flex w-full items-start justify-between gap-4 text-left"
        >
          <div>
            <h3 className="font-sans text-[1.25rem] font-medium tracking-[-0.015em] transition-colors duration-200 group-hover:text-accent">
              {role.company}
            </h3>
            <p className="mt-1 font-mono text-[12px] text-accent">
              {role.title}
            </p>
          </div>
          <span
            aria-hidden
            className="font-mono text-[13px] text-ink-dim transition-colors duration-200 group-hover:text-ink"
          >
            {open ? "−" : "+"}
          </span>
        </button>

        {open && (
          <ul id={panelId} className="mt-5 flex animate-rise flex-col gap-2.5">
            {role.bullets.map((b) => (
              <li
                key={b}
                className="relative pl-5 text-[0.95rem] leading-[1.6] text-ink-dim"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-[0.72em] h-px w-2.5 bg-rule"
                />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
