import { profile } from "@/content/profile";
import { publishedPosts, toRfc822 } from "@/lib/thoughts";
import { SITE_URL } from "@/site.config";

/** Generated at build time, like every other route here. */
export const dynamic = "force-static";

const FEED_DESCRIPTION = "Short essays by Ari Shah.";

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}

export function GET(): Response {
  const items = publishedPosts
    .map((post) => {
      const url = `${SITE_URL}/thoughts/${post.slug}`;
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${toRfc822(post.date)}</pubDate>`,
        `      <description>${escapeXml(post.summary)}</description>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`thoughts — ${profile.handle}`)}</title>
    <link>${SITE_URL}/thoughts</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/thoughts/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
