import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { profile } from "@/content/profile";
import { renderMarkdown } from "@/lib/markdown";
import { adjacentPosts, formatPostDate, getPost, posts } from "@/lib/thoughts";
import { features, SITE_URL } from "@/site.config";

type Params = { slug: string };

/**
 * No on-demand rendering: a slug that wasn't built 404s. In production `posts`
 * excludes drafts, so this is what keeps an unpublished URL unreachable.
 */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const path = `/thoughts/${post.slug}`;
  const indexable = features.thoughts && !post.draft;

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: path },
    robots: indexable ? undefined : { index: false, follow: false },
    // Metadata merges shallowly — a page's `openGraph` replaces the layout's
    // entirely, so every field this post needs is set here rather than
    // inherited. `images` included: the root opengraph-image.tsx does NOT
    // fill itself back in once a route declares its own `openGraph`, and a
    // card with no image is the result.
    openGraph: {
      type: "article",
      url: `${SITE_URL}${path}`,
      siteName: profile.handle,
      title: `${post.title} — ${profile.handle}`,
      description: post.summary,
      publishedTime: post.date,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — ${profile.handle}`,
      description: post.summary,
      images: ["/opengraph-image"],
    },
  };
}

export default async function ThoughtPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const html = await renderMarkdown(post.body);
  const { prev, next } = adjacentPosts(slug);

  return (
    <article className="shell py-14 sm:py-20">
      <Link
        href="/thoughts"
        className="font-mono text-[12px] text-ink-dim hover:text-ink transition-colors duration-200"
      >
        ← All thoughts
      </Link>

      <header className="mt-12 border-b border-rule pb-10">
        <h1 className="font-sans text-[clamp(2.25rem,7vw,4rem)] font-medium tracking-[-0.035em] leading-[0.98]">
          {post.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-3 chrome text-ink-dim">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden>·</span>
          <span>{post.readingMinutes} min read</span>
          {post.draft && (
            <>
              <span aria-hidden>·</span>
              <span className="text-accent">draft</span>
            </>
          )}
        </div>
      </header>

      {/* Safe by construction: this HTML came out of the local markdown
          pipeline, which drops raw HTML from the source. See lib/markdown.ts. */}
      <div
        className="post mt-12 max-w-[42rem]"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {(prev || next) && (
        <nav
          aria-label="More thoughts"
          className="mt-20 grid gap-6 border-t border-rule pt-8 sm:grid-cols-2"
        >
          {prev && (
            <Link href={`/thoughts/${prev.slug}`} className="group">
              <span className="chrome text-ink-dim">← Older</span>
              <p className="mt-2 font-sans text-[1.25rem] font-medium tracking-[-0.02em] transition-colors duration-200 group-hover:text-accent">
                {prev.title}
              </p>
            </Link>
          )}
          {next && (
            <Link
              href={`/thoughts/${next.slug}`}
              className="group sm:col-start-2 sm:text-right"
            >
              <span className="chrome text-ink-dim">Newer →</span>
              <p className="mt-2 font-sans text-[1.25rem] font-medium tracking-[-0.02em] transition-colors duration-200 group-hover:text-accent">
                {next.title}
              </p>
            </Link>
          )}
        </nav>
      )}
    </article>
  );
}
