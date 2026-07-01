import Link from "next/link";
import type { TimelineEvent } from "@/lib/types";
import { formatDate } from "@/lib/format";

interface TimelineProps {
  events: TimelineEvent[];
  /** Optional map of document id -> title, to label each event's source. */
  docTitleById?: Record<string, string>;
}

export function Timeline({ events, docTitleById }: TimelineProps) {
  if (events.length === 0) return null;

  return (
    <ol className="space-y-4">
      {events.map((e, i) => {
        const href = `/documents/${e.documentId}${e.page ? `#page-${e.page}` : ""}`;
        const sourceTitle = docTitleById?.[e.documentId];
        return (
          <li key={`${e.documentId}-${i}`} className="grid grid-cols-[6.5rem_1fr] gap-3">
            <div className="pt-0.5 font-mono text-xs text-muted">
              {e.dateLabel ?? formatDate(e.date)}
            </div>
            <div className="border-l border-line pl-3">
              <div className="text-sm text-ink">{e.title}</div>
              <Link href={href} className="text-xs text-muted hover:text-ink">
                {sourceTitle ? `Source: ${sourceTitle}` : "View source"} ▸
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
