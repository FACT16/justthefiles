import Link from "next/link";
import type { GovDocument } from "@/lib/types";
import { formatDate, formatPercent, ocrQualityLabel } from "@/lib/format";
import { agencyName } from "./agency-badge";

export function ProvenancePanel({ doc }: { doc: GovDocument }) {
  const rows: Array<[string, React.ReactNode]> = [];
  rows.push(["Agency", agencyName(doc.agency)]);
  rows.push(["Source", doc.sourceName]);
  rows.push(["Document date", doc.docDateLabel ?? formatDate(doc.docDate)]);
  rows.push(["Released", formatDate(doc.releaseDate)]);
  if (doc.classificationEra) rows.push(["Classification", doc.classificationEra]);
  if (typeof doc.pageCount === "number") {
    rows.push(["Pages", doc.pageCount.toLocaleString()]);
  }
  if (typeof doc.ocrConfidence === "number") {
    rows.push([
      "OCR confidence",
      `${formatPercent(doc.ocrConfidence)} · ${ocrQualityLabel(doc.ocrConfidence)}`,
    ]);
  }
  rows.push(["Language", doc.language]);

  return (
    <aside className="rounded border border-line bg-paper">
      <div className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-faint">
        Provenance
      </div>
      <dl className="divide-y divide-line-soft">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3 px-4 py-2 text-sm">
            <dt className="w-32 shrink-0 text-muted">{k}</dt>
            <dd className="min-w-0 text-ink-soft">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="border-t border-line px-4 py-3">
        <a
          href={doc.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded bg-ink px-3 py-2 text-sm font-medium text-paper hover:bg-ink-soft hover:no-underline"
        >
          View original document ↗
        </a>
        <div className="mt-2 text-center text-xs">
          <Link href="/about" className="text-muted hover:text-ink">
            Report a problem with this record
          </Link>
        </div>
      </div>
    </aside>
  );
}
