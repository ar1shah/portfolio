import { profile } from "@/content/profile";
import { AsciiWordmark } from "./AsciiWordmark";
import { ExternalLink } from "@/components/ui/ExternalLink";
import { BackToTop } from "@/components/ui/BackToTop";

const ICON = {
  github: (
    <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
  ),
  linkedin: (
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
  ),
  resume: (
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 2.5L17.5 8H14V4.5ZM8 13h8v1.5H8V13Zm0 3.5h8V18H8v-1.5ZM8 9.5h3V11H8V9.5Z" />
  ),
};

function IconLink({
  href,
  label,
  children,
  download,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
  download?: boolean;
}) {
  const cls =
    "flex h-10 w-10 items-center justify-center rounded-full border border-rule text-ink-dim transition-colors duration-200 hover:border-accent hover:text-accent";
  const svg = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {children}
    </svg>
  );

  // The resume is a local file, so it does not need the external treatment.
  return download ? (
    <a href={href} aria-label={label} className={cls} target="_blank" rel="noopener">
      {svg}
    </a>
  ) : (
    <ExternalLink href={href} aria-label={label} className={cls}>
      {svg}
    </ExternalLink>
  );
}

export function Footer() {
  return (
    <footer className="mt-32 border-t border-rule">
      <div className="shell py-14">
        {/* No `hairline` here: this is the first row in the footer, and the
            footer's own top border already separates it from the page. A
            second rule 14px below the first reads as a mistake. */}
        <div className="grid gap-10 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="flex flex-col gap-4">
            <AsciiWordmark variant="footer" />
            <p className="font-mono text-[11px] text-ink-dim">
              © {new Date().getFullYear()} {profile.name} · {profile.location}
            </p>
          </div>

          <div className="flex justify-start md:justify-center">
            <BackToTop />
          </div>

          <div className="flex items-center gap-3 md:justify-end">
            <IconLink href={profile.links.github} label="GitHub">
              {ICON.github}
            </IconLink>
            <IconLink href={profile.links.linkedin} label="LinkedIn">
              {ICON.linkedin}
            </IconLink>
            <IconLink href={profile.links.resume} label="Résumé (PDF)" download>
              {ICON.resume}
            </IconLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
