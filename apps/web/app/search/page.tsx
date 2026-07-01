import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "@/components/search-client";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search declassified and publicly released U.S. government documents. Filter by agency, topic, and year — every result links to the original source.",
};

// The site is statically exported, so this page is a pre-rendered shell and the
// query string is handled client-side by SearchClient (hence the Suspense
// boundary, which useSearchParams requires during prerendering).
export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted">Loading search…</div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
