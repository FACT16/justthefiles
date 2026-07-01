import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-24 text-center">
      <div className="font-mono text-xs uppercase tracking-[0.2em] text-faint">Error 404</div>
      <h1 className="mt-3 text-2xl font-semibold text-ink">This record could not be found</h1>
      <p className="mt-2 text-muted">
        The document or page you&rsquo;re looking for isn&rsquo;t in the archive.
      </p>
      <div className="mt-6">
        <Link
          href="/"
          className="inline-block rounded bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft hover:no-underline"
        >
          Return to search
        </Link>
      </div>
    </div>
  );
}
