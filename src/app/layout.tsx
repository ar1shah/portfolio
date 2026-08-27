import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { profile } from "@/content/profile";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
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

const SITE = "https://ar13.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
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
  authors: [{ name: profile.name, url: SITE }],
  creator: profile.name,
  openGraph: {
    type: "website",
    url: SITE,
    siteName: profile.handle,
    title: `${profile.name} — Software Engineer`,
    description:
      "Full-stack work in TypeScript, Next.js, and Postgres. Also reachable over SSH.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — Software Engineer`,
    description:
      "Full-stack work in TypeScript, Next.js, and Postgres. Also reachable over SSH.",
  },
  alternates: { canonical: SITE },
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
