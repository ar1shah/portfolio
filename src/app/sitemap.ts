import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/projects";

const SITE = "https://ar13.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...caseStudies.map((p) => ({
      url: `${SITE}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
