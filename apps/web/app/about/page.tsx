import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About & method",
  description:
    "What Just the Files is, where its documents come from, and the principles behind it: primary sources, exact citations, and no interpretation.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">About &amp; method</h1>

      <div className="doc-prose mt-6 space-y-4">
        <p>
          <strong>Just the Files</strong> is a research tool for searching declassified and
          publicly released U.S. government documents. The goal is simple: make the
          primary sources easy to find and easy to read, and link every result back to the
          original government document so anyone can verify it.
        </p>

        <h2 className="pt-2 text-base font-semibold text-ink">Where the documents come from</h2>
        <p>
          Records are drawn from official, public sources — the National Archives, the
          Office of the Director of National Intelligence, the All-domain Anomaly Resolution
          Office, the Government Publishing Office (govinfo), the State Department&rsquo;s
          Office of the Historian, the CIA&rsquo;s FOIA reading room, and federal court
          dockets via CourtListener, among others.
        </p>

        <h2 className="pt-2 text-base font-semibold text-ink">Principles</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Primary sources only.</strong> Every claim traces to an original
            document. Where a record is redacted, it is shown as redacted.
          </li>
          <li>
            <strong>Exact citations.</strong> Results cite the specific page, and link to
            the authoritative source. Nothing is presented that cannot be checked.
          </li>
          <li>
            <strong>No interpretation.</strong> Just the Files does not tell you what to think.
            It surfaces the documents and lets you read them.
          </li>
          <li>
            <strong>AI stays in the background.</strong> Machine assistance is used only to
            improve search, organization, and discovery — never to generate answers that
            could misstate a source.
          </li>
        </ul>

        <h2 className="pt-2 text-base font-semibold text-ink">This is an early build</h2>
        <p>
          You are looking at a Phase 1 demo running on a curated sample of real records.
          Document metadata (titles, agencies, dates, sources) is real; the body excerpts
          shown here are illustrative pending full-text ingestion. The roadmap adds the
          full corpus, real OCR text, entity relationships, and a feed of new releases.
        </p>

        <h2 className="pt-2 text-base font-semibold text-ink">Corrections</h2>
        <p>
          Found a record that is mislabeled, mis-dated, or linked to the wrong source?
          Corrections are welcome — accuracy is the entire point.
        </p>

        <p className="border-t border-line-soft pt-4 text-sm text-faint">
          Just the Files is an independent research tool and is not affiliated with, or endorsed
          by, any government agency. All referenced documents are public records.
        </p>
      </div>
    </div>
  );
}
