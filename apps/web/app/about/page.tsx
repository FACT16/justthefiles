import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About & method",
  description:
    "What Just the Files is, where its records come from, and the rules it follows: primary sources, verbatim excerpts, exact source links, and no interpretation.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">About &amp; method</h1>

      <div className="doc-prose mt-6 space-y-4">
        <p>
          <strong>Just the Files</strong> is a research tool for searching declassified and
          publicly released U.S. government documents. The goal is simple: make primary
          sources easy to find and easy to read, and link every result back to the
          original government document so anyone can verify it.
        </p>

        <h2 className="pt-2 text-base font-semibold text-ink">Where the records come from</h2>
        <p>
          The pipeline ingests directly from official publishers: the{" "}
          <strong>Federal Register</strong> (presidential documents), <strong>GovInfo</strong>{" "}
          — the U.S. Government Publishing Office&rsquo;s official corpus (committee
          reports, hearings, public laws) — the Department of War&rsquo;s{" "}
          <strong>war.gov/UFO</strong> release portal, and the{" "}
          <strong>Library of Congress</strong> (digitized imagery). National Archives
          ingestion, including the UAP Records Collection (RG 615), ships in the pipeline
          and activates when its API key is configured.
        </p>
        <p>
          A small set of hand-cataloged records also points to landmark releases at other
          official sources — the National Archives, ODNI, the FBI&rsquo;s FOIA reading
          room, the CIA&rsquo;s reading room, and federal court dockets. The{" "}
          <Link href="/sources">Sources &amp; monitoring</Link> page lists every channel,
          how it is watched, and whether the most recent automated check succeeded.
        </p>

        <h2 className="pt-2 text-base font-semibold text-ink">The rules</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Official publishers only.</strong> Every record comes from a
            government publisher of the document itself — no third-party aggregators, no
            user-upload hosts.
          </li>
          <li>
            <strong>Verbatim excerpts or none.</strong> Body text shown on this site is
            extracted from the source document itself. When a document&rsquo;s text
            cannot be extracted, the record shows its metadata and the source link — the
            tool never substitutes prose of its own. Page numbers are shown only when
            they are real page boundaries in the source document.
          </li>
          <li>
            <strong>Descriptions are not written here.</strong> A record&rsquo;s
            description is the document&rsquo;s own opening text, the publishing
            agency&rsquo;s official abstract, or the source archive&rsquo;s catalog note.
            Hand-cataloged landmark records carry a short factual note stating who
            released the records, when, and under what authority — nothing about what
            they mean.
          </li>
          <li>
            <strong>Everything checks out.</strong> Every result links to the
            authoritative source, and every source link is re-verified on each scheduled
            run.
          </li>
          <li>
            <strong>No interpretation.</strong> Just the Files does not tell you what to
            think. It surfaces the documents and lets you read them.
          </li>
        </ul>

        <h2 className="pt-2 text-base font-semibold text-ink">This is an early build</h2>
        <p>
          The corpus is a few hundred records and grows on every scheduled run. Search
          runs entirely in the browser over pre-rendered pages; there is no backend yet.
          The roadmap adds per-file ingestion of large releases, full-text search across
          complete documents, and detection of redaction markings in extracted text —
          each lands only when it can meet the rules above.
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
