import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
};

/** Every outbound link on the site goes through here, so rel is never missed. */
export function ExternalLink({ href, children, className = "", ...rest }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}
