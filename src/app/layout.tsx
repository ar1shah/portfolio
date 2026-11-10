import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { profile } from "@/content/profile";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { features, SITE_URL } from "@/site.config";
import "./globals.css";

const sans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  display: "swap",
});

// Italic only — it exists for one or two accent words in the hero.
const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} — Software Engineer`,
    template: `%s — ${profile.handle}`,
  },
  description:
    "Software engineer and CS student at UCF. Full-stack work in TypeScript, Next.js, and Postgres — most of it built for people who needed it at work.",
  keywords: [
    "Ari Shah",
    "software engineer",
    "full stack developer",
    "UCF",
    "TypeScript",
    "Next.js",
  ],
  authors: [{ name: profile.name, url: SITE_URL }],
  creator: profile.name,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: profile.handle,
    title: `${profile.name} — Software Engineer`,
    description:
      "Full-stack work in TypeScript, Next.js, and Postgres.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — Software Engineer`,
    description:
      "Full-stack work in TypeScript, Next.js, and Postgres.",
  },
  alternates: {
    canonical: SITE_URL,
    // Feed autodiscovery — only once the blog is announced.
    types: features.thoughts
      ? { "application/rss+xml": `${SITE_URL}/thoughts/rss.xml` }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-raised focus:px-4 focus:py-2 focus:text-ink chrome"
        >
          Skip to content
        </a>
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
