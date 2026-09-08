"use client";

// Progressive result list — renders a capped batch and reveals more on demand,
// so a large topic (executive orders, latest releases) doesn't wall off the page
// with hundreds of cards. Shared by the topic pages; search has its own copy
// wired to filter state.

import { useState } from "react";
import { ResultCard } from "@/components/result-card";
import type { SearchHit } from "@/lib/types";

export function ResultList({ hits, pageSize = 20 }: { hits: SearchHit[]; pageSize?: number }) {
  const [visible, setVisible] = useState(pageSize);
  const shown = hits.slice(0, visible);
  const remaining = hits.length - shown.length;

  return (
    <>
      <div className="border-t border-line-soft">
        {shown.map((hit) => (
          <ResultCard key={hit.document.id} hit={hit} />
        ))}
      </div>
      {remaining > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + pageSize)}
            className="rounded border border-line bg-paper px-4 py-2 text-sm text-ink hover:border-accent"
          >
            Load {Math.min(pageSize, remaining)} more{" "}
            <span className="text-faint">({remaining.toLocaleString()} left)</span>
          </button>
        </div>
      )}
    </>
  );
}
