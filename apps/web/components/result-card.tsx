import Link from "next/link";
import type { SearchHit } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { displayTitle, docTypeLabel } from "@/lib/doc-meta";
import { AgencyBadge, agencyName } from "./agency-badge";

export function ResultCard({ hit }: { hit: SearchHit }) {
  const d = hit.document;
  return (
    <article className="border-b border-line-soft py-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <AgencyBadge code={d.agency} />
        <span>{agencyName(d.agency)}</span>
        <span aria-hidden>·</span>
        <span className="text-ink-soft">{docTypeLabel(d)}</span>
        <span aria-hidden>·</span>
        <span>Released {formatDate(d.releaseDate)}</span>
        <span aria-hidden>·</span>
        <span>{d.sourceName}</span>
      </div>

      <h3 className="mt-1.5 text-[1.0625rem] leading-snug">
        <Link href={`/documents/${d.id}`} className="font-medium text-link">
          {displayTitle(d.title)}
        </Link>
      </h3>

      {hit.snippetHtml ? (
        <p
          className="mt-1.5 text-sm leading-relaxed text-ink-soft"
          // Snippet text is HTML-escaped in buildSnippet(); only <mark> is injected.
          dangerouslySetInnerHTML={{ __html: hit.snippetHtml }}
        />
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
        {/* A page number is shown only when it is a real page in the source
            document — never for excerpts whose page boundaries are unknown. */}
        {d.pages.length > 0 && !d.excerptOnly ? (
          <Link href={`/documents/${d.id}#page-${hit.page}`} className="text-muted hover:text-ink">
            Page {hit.page}
          </Link>
        ) : (
          <Link href={`/documents/${d.id}`} className="text-muted hover:text-ink">
            Record details
          </Link>
        )}
        <a
          href={d.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link"
        >
          View original ↗
        </a>
      </div>
    </article>
  );
}
