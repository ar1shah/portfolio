import Link from "next/link";

export default function NotFound() {
  return (
    <section className="shell flex min-h-[60vh] flex-col justify-center py-24">
      <p className="chrome text-accent">404</p>
      <h1 className="mt-4 font-sans text-[clamp(2rem,6vw,3.5rem)] font-medium tracking-[-0.03em]">
        Nothing here.
      </h1>
      <p className="mt-4 max-w-md text-ink-dim">
        The page you asked for does not exist, which is at least an honest
        answer.
      </p>
      <Link
        href="/"
        className="mt-8 font-mono text-[13px] text-ink-dim hover:text-ink transition-colors duration-200"
      >
        ← Back home
      </Link>
    </section>
  );
}
