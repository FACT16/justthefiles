"use client";

// Client-side search over the bundled corpus. The site is statically exported
// (no server), so /search is a static shell and this component does the work in
// the browser: read the query string, run the same scoring the server version
// used, render results. Phase 2 swaps the searchDocumentsSync call for the API.

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { SearchBar } from "@/components/search-bar";
import { ResultCard } from "@/components/result-card";
import { searchDocumentsSync } from "@/lib/api";
import { findEntitiesInQuery } from "@/lib/entities";
import { ConnectionPanel } from "@/components/connection-panel";
import type { AgencyCode, SearchFilters } from "@/lib/types";

// Inlined at build; "/justthefiles" on GitHub Pages. Needed for the raw <form>
// fallback, which — unlike next/link — does not get basePath applied.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function buildHref(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `/search?${s}` : "/search";
}

export function SearchClient() {
  const sp = useSearchParams();
  const q = sp.get("q")?.trim() ?? "";
  const selectedAgency = sp.get("agency") ?? undefined;
  const selectedTopic = sp.get("topic") ?? undefined;
  const from = sp.get("from") ?? undefined;
  const to = sp.get("to") ?? undefined;

  const filters: SearchFilters = useMemo(
    () => ({
      agencies: selectedAgency ? [selectedAgency as AgencyCode] : undefined,
      collections: selectedTopic ? [selectedTopic] : undefined,
      yearFrom: from && /^\d{4}$/.test(from) ? Number(from) : undefined,
      yearTo: to && /^\d{4}$/.test(to) ? Number(to) : undefined,
    }),
    [selectedAgency, selectedTopic, from, to],
  );

  const results = useMemo(() => searchDocumentsSync(q, filters), [q, filters]);
  const queryEntities = useMemo(() => findEntitiesInQuery(q), [q]);

  const base = { q: q || undefined, from, to };
  const hasActiveFilter = Boolean(selectedAgency || selectedTopic || from || to);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line-soft pb-3">
        <div>
          <h1 className="text-lg font-semibold text-ink">
            {q ? <>Results for “{q}”</> : "Browse all documents"}
          </h1>
          <p className="text-sm text-muted">
            {results.total.toLocaleString()} {results.total === 1 ? "result" : "results"}{" "}
            in {results.tookMs} ms
          </p>
        </div>
        <div className="hidden w-72 sm:block">
          <SearchBar variant="compact" initialQuery={q} />
        </div>
      </div>

      {queryEntities.length >= 2 && <ConnectionPanel entities={queryEntities} />}

      {/* Active filters */}
      {hasActiveFilter && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-faint">Filters:</span>
          {selectedAgency && (
            <Link
              href={buildHref({ ...base, topic: selectedTopic })}
              className="rounded-sm border border-line bg-paper px-2 py-0.5 text-muted hover:border-accent hover:text-ink hover:no-underline"
            >
              Agency: {selectedAgency} ✕
            </Link>
          )}
          {selectedTopic && (
            <Link
              href={buildHref({ ...base, agency: selectedAgency })}
              className="rounded-sm border border-line bg-paper px-2 py-0.5 text-muted hover:border-accent hover:text-ink hover:no-underline"
            >
              Topic: {selectedTopic} ✕
            </Link>
          )}
          {(from || to) && (
            <Link
              href={buildHref({ q: q || undefined, agency: selectedAgency, topic: selectedTopic })}
              className="rounded-sm border border-line bg-paper px-2 py-0.5 text-muted hover:border-accent hover:text-ink hover:no-underline"
            >
              Years: {from || "…"}–{to || "…"} ✕
            </Link>
          )}
          <Link href={buildHref({ q: q || undefined })} className="text-link">
            Clear all
          </Link>
        </div>
      )}

      <div className="mt-4 grid gap-8 md:grid-cols-[12rem_1fr]">
        {/* Facets */}
        <aside className="space-y-6 text-sm">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
              Agency
            </div>
            <ul className="space-y-1">
              {results.facets.agencies.map((f) => {
                const active = selectedAgency === f.value;
                return (
                  <li key={f.value} className="flex items-baseline justify-between gap-2">
                    <Link
                      href={buildHref({
                        ...base,
                        topic: selectedTopic,
                        agency: active ? undefined : f.value,
                      })}
                      className={active ? "font-medium text-ink hover:no-underline" : ""}
                    >
                      {active ? "✓ " : ""}
                      {f.label}
                    </Link>
                    <span className="text-faint">{f.count}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
              Topic
            </div>
            <ul className="space-y-1">
              {results.facets.collections.map((f) => {
                const active = selectedTopic === f.value;
                return (
                  <li key={f.value} className="flex items-baseline justify-between gap-2">
                    <Link
                      href={buildHref({
                        ...base,
                        agency: selectedAgency,
                        topic: active ? undefined : f.value,
                      })}
                      className={active ? "font-medium text-ink hover:no-underline" : ""}
                    >
                      {active ? "✓ " : ""}
                      {f.label}
                    </Link>
                    <span className="text-faint">{f.count}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-faint">
              Year
            </div>
            <form
              method="get"
              action={`${BASE_PATH}/search/`}
              className="flex flex-wrap items-center gap-2"
            >
              {q && <input type="hidden" name="q" value={q} />}
              {selectedAgency && <input type="hidden" name="agency" value={selectedAgency} />}
              {selectedTopic && <input type="hidden" name="topic" value={selectedTopic} />}
              <input
                name="from"
                defaultValue={from}
                placeholder="From"
                inputMode="numeric"
                className="w-16 rounded border border-line bg-paper px-2 py-1 text-sm"
              />
              <span className="text-faint">–</span>
              <input
                name="to"
                defaultValue={to}
                placeholder="To"
                inputMode="numeric"
                className="w-16 rounded border border-line bg-paper px-2 py-1 text-sm"
              />
              <button
                type="submit"
                className="rounded border border-line px-2 py-1 text-sm hover:border-accent"
              >
                Apply
              </button>
            </form>
          </div>
        </aside>

        {/* Results */}
        <div>
          {results.hits.length > 0 ? (
            <div className="border-t border-line-soft">
              {results.hits.map((hit) => (
                <ResultCard key={hit.document.id} hit={hit} />
              ))}
            </div>
          ) : (
            <div className="rounded border border-line bg-paper p-8 text-center">
              <p className="text-ink">No documents match your search.</p>
              <p className="mt-1 text-sm text-muted">
                Try a different term{hasActiveFilter ? ", or " : "."}
                {hasActiveFilter && (
                  <Link href={buildHref({ q: q || undefined })}>clear your filters</Link>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
