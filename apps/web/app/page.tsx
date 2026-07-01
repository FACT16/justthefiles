import Link from "next/link";
import { SearchBar } from "@/components/search-bar";
import { ResultCard } from "@/components/result-card";
import { buildSnippet } from "@/lib/search";
import { getRecentReleases, getStats, listCollections } from "@/lib/api";
import type { SearchHit } from "@/lib/types";

const EXAMPLE_QUERIES = ["Oswald Mexico City", "MKUltra", "UAP", "Epstein", "COINTELPRO"];

export default async function HomePage() {
  const [stats, collections, recent] = await Promise.all([
    getStats(),
    listCollections(),
    getRecentReleases(5),
  ]);

  const recentHits: SearchHit[] = recent.map((d) => ({
    document: d,
    score: 0,
    page: d.pages[0]?.pageNumber ?? 1,
    matchedTerms: [],
    snippetHtml: buildSnippet(d.summary, []),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="border-b border-line-soft py-10 sm:py-14">
        <h1 className="max-w-2xl text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Search declassified U.S. government documents — and read the originals.
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          One place to find what the government has actually released. Every result links
          straight to the original source. No spin, no agenda — just the documents.
        </p>

        <div className="mt-5 max-w-2xl">
          <SearchBar variant="large" autoFocus />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-faint">Try:</span>
          {EXAMPLE_QUERIES.map((q) => (
            <Link
              key={q}
              href={`/search?q=${encodeURIComponent(q)}`}
              className="rounded-sm border border-line bg-paper px-2 py-0.5 text-xs text-muted hover:border-accent hover:text-ink hover:no-underline"
            >
              {q}
            </Link>
          ))}
        </div>

        <p className="mt-5 text-xs text-faint">
          {stats.documentCount.toLocaleString()} documents ·{" "}
          {stats.pageCount.toLocaleString()} pages · {stats.agencyCount} agencies ·{" "}
          {stats.collectionCount} topics
        </p>
      </section>

      <section className="py-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-faint">
            Browse by topic
          </h2>
          <Link href="/topics" className="text-sm">
            All topics →
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link
              key={c.slug}
              href={`/topics/${c.slug}`}
              className="block rounded border border-line bg-paper p-4 hover:border-accent hover:no-underline"
            >
              <div className="font-medium text-ink">{c.title}</div>
              <p className="mt-1 line-clamp-3 text-sm text-muted">{c.blurb}</p>
              <div className="mt-2 text-xs text-faint">{c.documentIds.length} documents</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-line-soft py-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-faint">
          Recently released
        </h2>
        <div className="mt-2 border-t border-line-soft">
          {recentHits.map((hit) => (
            <ResultCard key={hit.document.id} hit={hit} />
          ))}
        </div>
      </section>
    </div>
  );
}
