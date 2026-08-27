import { experience } from "@/content/experience";
import { SectionLabel } from "@/components/site/SectionLabel";

export function Timeline() {
  return (
    <section id="experience" className="shell scroll-mt-24 py-20">
      <SectionLabel index="02">experience</SectionLabel>

      <ol className="mt-12">
        {experience.map((role) => (
          <li
            key={`${role.company}-${role.start}`}
            className="grid gap-x-10 gap-y-4 border-t border-rule py-8 sm:grid-cols-[9rem_1fr]"
          >
            <div className="flex flex-col gap-1">
              <span className="chrome text-ink-dim whitespace-nowrap">
                {role.start} — {role.end}
              </span>
              {role.kind === "education" && (
                <span className="chrome text-ink-dim">education</span>
              )}
            </div>

            <div>
              <h3 className="font-sans text-[1.25rem] font-medium tracking-[-0.015em]">
                {role.company}
              </h3>
              <p className="mt-1 font-mono text-[12px] text-accent">
                {role.title}
              </p>

              <ul className="mt-5 flex flex-col gap-2.5">
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
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
