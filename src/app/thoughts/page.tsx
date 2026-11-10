import type { Metadata } from "next";
import Link from "next/link";
import { formatPostDate, formatPostMonth, posts, postsByYear } from "@/lib/thoughts";
import { features } from "@/site.config";

/** The only prose on this page. Change it here. */
const LEDE = "Short essays, published when there is something worth saying.";

export const metadata: Metadata = {
  title: "Thoughts",
  description: LEDE,
  alternates: { canonical: "/thoughts" },
  // Reachable but not announced while the flag is off, so an empty blog never
  // gets indexed.
  robots: features.thoughts ? undefined : { index: false, follow: false },
};

export default function ThoughtsPage() {
  const years = postsByYear(posts);

  return (
    <div className="shell py-14 sm:py-20">
      <header className="border-b border-rule pb-10">
        <h1 className="font-sans text-[clamp(2.25rem,7vw,4rem)] font-medium tracking-[-0.035em] leading-[0.98]">
          thoughts
        </h1>
        <p className="mt-7 max-w-[42rem] text-[1.0625rem] leading-[1.7] text-ink-dim">
          {LEDE}
        </p>
      </header>

      {years.length === 0 ? (
        <p className="mt-14 text-[1.0625rem] leading-[1.7] text-ink-dim">
          Nothing published yet.
        </p>
      ) : (
        years.map(({ year, posts: inYear }) => (
          <section key={year} className="mt-14">
            <h2 className="chrome text-ink-dim">{year}</h2>

            <ul className="mt-5 border-b border-rule">
              {inYear.map((post) => (
                <li key={post.slug} className="group relative border-t border-rule">
                  {/* The row's hover affordance, same as ProjectCard's. */}
                  <span
                    aria-hidden
                    className="absolute -top-px left-0 h-px w-0 bg-accent transition-[width] duration-500 ease-out group-hover:w-full"
                  />
                  {/* The spans are flex items, so the whitespace between
                      them is dropped and the computed name would run
                      together as "TitledraftNov". Spelled out instead, with
                      the full date — the year only exists as a heading
                      above, which a row read on its own doesn't carry. */}
                  <Link
                    href={`/thoughts/${post.slug}`}
                    aria-label={`${post.title}${post.draft ? " (draft)" : ""} — ${formatPostDate(post.date)}`}
                    className="flex items-baseline justify-between gap-6 py-6"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="font-sans text-[1.25rem] font-medium tracking-[-0.02em] transition-colors duration-200 group-hover:text-accent">
                        {post.title}
                      </span>
                      {post.draft && <span className="chrome text-accent">draft</span>}
                    </span>
                    <span className="chrome text-ink-dim shrink-0">
                      {formatPostMonth(post.date)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
