import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * The /thoughts post store.
 *
 * Posts are `.md` files in `src/content/thoughts/`; the filename is the slug.
 * Everything here runs at build time against the local filesystem — this
 * module must only ever be imported from a server component or route handler.
 *
 * Markdown is NOT rendered here. The index, the sitemap and the feed only need
 * frontmatter, and rendering every post to highlighted HTML to list four
 * titles would be waste. The post page calls `renderMarkdown` itself.
 */

export type Post = {
  /** From the filename, minus `.md`. */
  slug: string;
  title: string;
  /** YYYY-MM-DD exactly as written in the frontmatter. */
  date: string;
  summary: string;
  draft: boolean;
  /** Raw markdown, frontmatter stripped. */
  body: string;
  readingMinutes: number;
};

export type PostYear = {
  year: number;
  posts: Post[];
};

const DIR = path.join(process.cwd(), "src", "content", "thoughts");

/**
 * Drafts are yours to see while writing and nobody else's. `next dev` shows
 * them; a production build omits them from the index, from
 * `generateStaticParams` (so the URL 404s), from the feed and from the sitemap.
 */
const INCLUDE_DRAFTS = process.env.NODE_ENV !== "production";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const WORDS_PER_MINUTE = 200;

function fail(file: string, problem: string): never {
  throw new Error(
    `Invalid post frontmatter in src/content/thoughts/${file}: ${problem}`,
  );
}

function requireString(
  file: string,
  data: Record<string, unknown>,
  key: string,
): string {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    fail(file, `\`${key}\` is required and must be a non-empty string`);
  }
  return value.trim();
}

/**
 * A real calendar date, not just four-two-two digits. `2026-02-31` matches the
 * shape and would silently roll over to March.
 */
function requireDate(file: string, data: Record<string, unknown>): string {
  const value = requireString(file, data, "date");
  if (!DATE_RE.test(value)) {
    fail(file, `\`date\` must be YYYY-MM-DD, got "${value}"`);
  }

  const [y, m, d] = value.split("-").map(Number);
  const asUtc = new Date(Date.UTC(y, m - 1, d));
  if (
    asUtc.getUTCFullYear() !== y ||
    asUtc.getUTCMonth() !== m - 1 ||
    asUtc.getUTCDate() !== d
  ) {
    fail(file, `\`date\` is not a real calendar date: "${value}"`);
  }

  return value;
}

function countWords(markdown: string): number {
  return markdown.split(/\s+/).filter(Boolean).length;
}

function readAll(): Post[] {
  if (!fs.existsSync(DIR)) return [];

  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".md"));
  const seen = new Map<string, string>();

  const all = files.map((file) => {
    const slug = file.replace(/\.md$/, "");

    const clash = seen.get(slug);
    if (clash) fail(file, `slug "${slug}" is already taken by ${clash}`);
    seen.set(slug, file);

    const raw = fs.readFileSync(path.join(DIR, file), "utf8");
    const { data, content } = matter(raw);

    const draft = data.draft;
    if (draft !== undefined && typeof draft !== "boolean") {
      fail(file, "`draft` must be true or false");
    }

    return {
      slug,
      title: requireString(file, data, "title"),
      date: requireDate(file, data),
      summary: requireString(file, data, "summary"),
      draft: draft === true,
      body: content.trim(),
      readingMinutes: Math.max(1, Math.round(countWords(content) / WORDS_PER_MINUTE)),
    };
  });

  // Newest first. Dates are fixed-width, so a string compare is the date
  // compare; the slug tiebreak keeps same-day ordering stable across machines.
  return all.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}

const everything = readAll();

/** What this environment should display — drafts included in dev only. */
export const posts: Post[] = INCLUDE_DRAFTS
  ? everything
  : everything.filter((p) => !p.draft);

/** Never drafts, in any environment. The feed and the sitemap use this. */
export const publishedPosts: Post[] = everything.filter((p) => !p.draft);

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

/** Newest year first, newest post first within each year. */
export function postsByYear(list: Post[]): PostYear[] {
  const years = new Map<number, Post[]>();

  for (const post of list) {
    const year = Number(post.date.slice(0, 4));
    const bucket = years.get(year);
    if (bucket) bucket.push(post);
    else years.set(year, [post]);
  }

  return [...years.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, p]) => ({ year, posts: p }));
}

/**
 * Neighbours in reading order. Unlike `adjacentCaseStudies`, this does not
 * wrap — the oldest post has nothing older, and pretending otherwise would
 * send a reader in a circle.
 */
export function adjacentPosts(slug: string): { prev?: Post; next?: Post } {
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return {};

  // `posts` is newest-first, so the next index is the older post.
  return { prev: posts[i + 1], next: posts[i - 1] };
}

/**
 * Dates are formatted in UTC on purpose. "2026-01-05" parsed as a local date
 * west of Greenwich renders as January 4th.
 */
function toUtcDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

const LONG = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const SHORT_MONTH = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});

/** "January 5, 2026" */
export function formatPostDate(date: string): string {
  return LONG.format(toUtcDate(date));
}

/** "Jan" — the right-hand column of the index. */
export function formatPostMonth(date: string): string {
  return SHORT_MONTH.format(toUtcDate(date));
}

/** RFC 822, which is what RSS wants. */
export function toRfc822(date: string): string {
  return toUtcDate(date).toUTCString();
}
