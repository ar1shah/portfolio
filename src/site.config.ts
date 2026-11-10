/**
 * Site-wide constants that more than one route needs.
 *
 * The canonical origin used to live as a local `const SITE` in layout.tsx,
 * sitemap.ts and robots.ts. The RSS feed needs it too, and a fourth copy is
 * three too many.
 */
export const SITE_URL = "https://ar13.dev";

/**
 * Sections that are built and reachable but not yet announced.
 *
 * `thoughts` gates the nav link, the sitemap entries and the RSS discovery
 * `<link>`, and flips the blog pages to `noindex`. The routes themselves
 * always build, so /thoughts is previewable while the flag is off.
 *
 * Deliberately typed `boolean` rather than inferred as the literal `false` —
 * flipping it should not start narrowing every condition that reads it.
 */
export const features: { thoughts: boolean } = {
  thoughts: false,
};
