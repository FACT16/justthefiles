import type { Metadata } from "next";
import { DOCUMENTS } from "@/lib/data";
import { formatYear } from "@/lib/format";

export const metadata: Metadata = {
  title: "Sources",
  description:
    "Where the documents come from — the official U.S. government publishers behind every record in the archive, with counts and date ranges.",
};

interface SourceRow {
  name: string;
  count: number;
  earliest: string;
  latest: string;
}

// The archive describes itself by what it actually holds: group the corpus by
// publisher, with a record count and the release-date range for each.
function coverage(): SourceRow[] {
  const by = new Map<string, { count: number; min: string; max: string }>();
  for (const d of DOCUMENTS) {
    const name = d.sourceName || "U.S. government";
    const date = d.releaseDate || d.docDate || "";
    const row = by.get(name) ?? { count: 0, min: date, max: date };
    row.count += 1;
    if (date && (!row.min || date < row.min)) row.min = date;
    if (date && (!row.max || date > row.max)) row.max = date;
    by.set(name, row);
  }
  return [...by.entries()]
    .map(([name, r]) => ({ name, count: r.count, earliest: r.min, latest: r.max }))
    .sort((a, b) => b.count - a.count);
}

export default function SourcesPage() {
  const rows = coverage();
  const total = rows.reduce((n, r) => n + r.count, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-semibold text-ink">Sources</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Every record in the archive comes from an official U.S. government publisher and
        links back to the original. This is what the archive currently holds, by source.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-faint">
              <th className="py-2 pr-4 font-medium">Publisher</th>
              <th className="py-2 pr-4 font-medium text-right tabular-nums">Records</th>
              <th className="py-2 font-medium">Release dates</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-line-soft align-baseline">
                <td className="py-2 pr-4 text-ink">{r.name}</td>
                <td className="py-2 pr-4 text-right tabular-nums text-muted">
                  {r.count.toLocaleString()}
                </td>
                <td className="py-2 text-muted">
                  {formatYear(r.earliest)}
                  {formatYear(r.earliest) !== formatYear(r.latest) && <> – {formatYear(r.latest)}</>}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="text-xs text-faint">
              <td className="py-2 pr-4">{rows.length} publishers</td>
              <td className="py-2 pr-4 text-right tabular-nums">{total.toLocaleString()}</td>
              <td className="py-2" />
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="mt-8 max-w-2xl text-sm text-muted">
        New records are pulled from these publishers on a schedule and added as they are
        released. The archive only grows — nothing already cataloged is removed.
      </p>
    </div>
  );
}
