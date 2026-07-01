import Link from "next/link";
import type { Metadata } from "next";
import { listCollections } from "@/lib/api";

export const metadata: Metadata = {
  title: "Topics",
  description:
    "Browse declassified U.S. government documents by topic — Epstein, UAP, JFK, MKUltra, September 11, and the broader historical record.",
};

export default async function TopicsPage() {
  const collections = await listCollections();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-xl font-semibold text-ink">Topics</h1>
      <p className="mt-1 max-w-2xl text-muted">
        Curated collections of primary-source documents. Each topic gathers the official
        record in one place, with every document linked to its government source.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {collections.map((c) => (
          <Link
            key={c.slug}
            href={`/topics/${c.slug}`}
            className="block rounded border border-line bg-paper p-4 hover:border-accent hover:no-underline"
          >
            <div className="font-medium text-ink">{c.title}</div>
            <p className="mt-1 text-sm text-muted">{c.blurb}</p>
            <div className="mt-2 text-xs text-faint">{c.documentIds.length} documents</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
