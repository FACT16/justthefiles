// Small presentation helpers. Pure functions, safe in server or client components.

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "1963-10-10" -> "October 10, 1963". Falls back to the raw string if unparseable. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Date unknown";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const year = Number(m[1]);
  const month = Number(m[2]) - 1;
  const day = Number(m[3]);
  if (month < 0 || month > 11) return iso;
  return `${MONTHS[month]} ${day}, ${year}`;
}

/** Year only, e.g. "1963". */
export function formatYear(iso: string | null | undefined): string {
  if (!iso) return "—";
  const m = /^(\d{4})/.exec(iso);
  return m ? m[1] : "—";
}

/** 0.82 -> "82%". */
export function formatPercent(n: number): string {
  return `${Math.round(n * 100)}%`;
}

/** A coarse quality label for an OCR confidence score. */
export function ocrQualityLabel(confidence: number): "High" | "Medium" | "Low" {
  if (confidence >= 0.85) return "High";
  if (confidence >= 0.6) return "Medium";
  return "Low";
}

/** Pluralize a count: pluralize(1, "result") -> "1 result". */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count.toLocaleString()} ${word}`;
}
