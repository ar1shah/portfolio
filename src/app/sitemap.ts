import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/projects";
import { publishedPosts } from "@/lib/thoughts";
import { features, SITE_URL } from "@/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Nothing about the blog is listed until it's announced — an empty index
  // in the sitemap is worse than no entry at all.
  const thoughts: MetadataRoute.Sitemap = features.thoughts
    ? [
        {
          url: `${SITE_URL}/thoughts`,
          lastModified: now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        },
        ...publishedPosts.map((post) => ({
          url: `${SITE_URL}/thoughts/${post.slug}`,
          lastModified: new Date(`${post.date}T00:00:00Z`),
          changeFrequency: "yearly" as const,
          priority: 0.6,
        })),
      ]
    : [];

  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...caseStudies.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    ...thoughts,
  ];
}
