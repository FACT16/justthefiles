import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProvenancePanel } from "@/components/provenance-panel";
import { AgencyBadge, agencyName } from "@/components/agency-badge";
import {
  getCollection,
  getDocument,
  getRelatedDocuments,
  listDocumentIds,
} from "@/lib/api";
import { formatDate } from "@/lib/format";

// Static export: pre-render every document page at build time. Unknown ids 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const ids = await listDocumentIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const doc = await getDocument((await params).id);
  if (!doc) return { title: "Document not found" };
  return { title: doc.title, description: doc.summary };
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const doc = await getDocument(id);
  if (!doc) notFound();

  const [related, collection] = await Promise.all([
    getRelatedDocuments(doc),
    getCollection(doc.collection),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <nav className="text-xs text-muted">
        <Link href="/">Home</Link>
        <span className="px-1.5 text-faint">/</span>
        {collection ? (
          <>
            <Link href={`/topics/${collection.slug}`}>{collection.title}</Link>
            <span className="px-1.5 text-faint">/</span>
          </>
        ) : null}
        <span className="text-faint">Document</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
        <AgencyBadge code={doc.agency} />
        <span>{agencyName(doc.agency)}</span>
        {doc.classificationEra && (
          <>
            <span aria-hidden>·</span>
            <span>{doc.classificationEra}</span>
          </>
        )}
      </div>

      <h1 className="mt-2 max-w-3xl text-2xl font-semibold leading-tight tracking-tight text-ink">
        {doc.title}
      </h1>
      <div className="mt-1 text-sm text-muted">
        {doc.docDateLabel ?? (doc.docDate ? formatDate(doc.docDate) : "Date unknown")}
        {" · "}Released {formatDate(doc.releaseDate)}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_20rem]">
        {/* Reading column */}
        <article className="min-w-0">
          <p className="max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">{doc.summary}</p>

          {doc.sourceNote ? (
            <div className="mt-4 rounded border border-line bg-canvas px-3 py-2 text-xs leading-relaxed text-muted">
              {doc.sourceNote} Use <span className="font-medium">View original</span> to read the
              full document at the source.
            </div>
          ) : doc.textIsIllustrative ? (
            <div className="mt-4 rounded border border-line bg-canvas px-3 py-2 text-xs leading-relaxed text-muted">
              <span className="font-medium text-ink-soft">Sample text.</span> The excerpts below
              are illustrative representations of this record for the demo — not verbatim OCR. Use{" "}
              <span className="font-medium">View original</span> to read the authoritative document
              at the source.
            </div>
          ) : null}

          <div className="mt-6 space-y-6">
            {doc.pages.map((p) => (
              <section
                key={p.pageNumber}
                id={`page-${p.pageNumber}`}
                className="scroll-mt-24 border-t border-line-soft pt-4"
              >
                <div className="mb-1.5 font-mono text-xs text-faint">Page {p.pageNumber}</div>
                <p className="doc-prose">{p.text}</p>
              </section>
            ))}
          </div>

          {doc.entities.length > 0 && (
            <div className="mt-8 border-t border-line-soft pt-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-faint">
                People &amp; entities in this document
              </h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {doc.entities.map((e) => (
                  <li key={e}>
                    <Link
                      href={`/search?q=${encodeURIComponent(e)}`}
                      className="rounded-sm border border-line bg-paper px-2 py-0.5 text-xs text-muted hover:border-accent hover:text-ink hover:no-underline"
                    >
                      {e}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-faint">
                Select a name to find every document that mentions it.
              </p>
            </div>
          )}
        </article>

        {/* Sidebar */}
        <div className="space-y-6">
          <ProvenancePanel doc={doc} />

          {related.length > 0 && (
            <div className="rounded border border-line bg-paper">
              <div className="border-b border-line px-4 py-2 text-xs font-semibold uppercase tracking-wide text-faint">
                Related documents
              </div>
              <ul className="divide-y divide-line-soft">
                {related.map((r) => (
                  <li key={r.id} className="px-4 py-3">
                    <Link href={`/documents/${r.id}`} className="text-sm text-link">
                      {r.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-faint">
                      {agencyName(r.agency)} · {formatDate(r.releaseDate)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
