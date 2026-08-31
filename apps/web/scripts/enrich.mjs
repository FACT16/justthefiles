// Entity enrichment + verbatim excerpts — the "no separate backend" path.
//
// Runs server-side (locally or in the scheduled GitHub Action), where browser CORS
// rules don't apply. For each ingested record it pulls the document's FULL TEXT
// from the government source — Federal Register raw text; GovInfo HTML rendition,
// falling back to the PDF rendition — scans it for a dictionary of notable
// people/orgs/programs, and writes the matches into each record's `entities`.
//
// The excerpt rule is absolute: body text is written onto a record ONLY when it
// was extracted from the source document itself. A record whose source yields no
// text keeps an empty summary and no pages — the site renders metadata and the
// source link, never substitute prose. PDF-derived excerpts keep their real page
// numbers, which is what makes an on-site page citation an actual citation.
//
//   node scripts/enrich.mjs
//
// It reads and rewrites lib/generated-documents.json in place.

import { readFile, writeFile } from "node:fs/promises";
import {
  extractDescription,
  extractExcerpt,
  excerptPages,
  fetchPdfPages,
  fetchText,
  stripHtml,
} from "./text-extract.mjs";

const FILE = new URL("../lib/generated-documents.json", import.meta.url);

// Shown beside excerpts in the viewer — only ever set when text was extracted.
const EXTRACTED_NOTE =
  "Verbatim text extracted from the official document as published by the source; read the full document at the source.";

// Canonical name -> alias patterns (matched case-insensitively, on word boundaries).
// Prefer full names where a bare surname would be ambiguous or noisy.
const ENTITIES = {
  "Jeffrey Epstein": ["jeffrey epstein", "epstein"],
  "Ghislaine Maxwell": ["ghislaine maxwell", "maxwell"],
  "Virginia Giuffre": ["virginia giuffre", "giuffre"],
  "Prince Andrew": ["prince andrew"],
  "Donald Trump": ["donald trump", "donald j. trump", "president trump"],
  "Bill Clinton": ["bill clinton", "william j. clinton", "william jefferson clinton"],
  "Hillary Clinton": ["hillary clinton", "hillary rodham clinton"],
  "Lee Harvey Oswald": ["lee harvey oswald", "oswald"],
  "John F. Kennedy": ["john f. kennedy", "john fitzgerald kennedy", "president kennedy"],
  "Robert F. Kennedy": ["robert f. kennedy", "robert kennedy"],
  "Martin Luther King Jr.": ["martin luther king", "dr. king"],
  "J. Edgar Hoover": ["j. edgar hoover", "edgar hoover"],
  "Richard Nixon": ["richard nixon", "president nixon"],
  "Sidney Gottlieb": ["sidney gottlieb", "gottlieb"],
  "Fidel Castro": ["fidel castro"],
  "Osama bin Laden": ["osama bin laden", "usama bin laden", "bin laden"],
  "Saddam Hussein": ["saddam hussein"],
  "Mohammad Mosaddegh": ["mosaddegh", "mossadegh"],
  "Central Intelligence Agency": ["central intelligence agency", "cia"],
  "Federal Bureau of Investigation": ["federal bureau of investigation", "fbi"],
  "National Security Agency": ["national security agency"],
  "Department of Defense": ["department of defense", "department of war", "pentagon"],
  "Department of Justice": ["department of justice"],
  "MKUltra": ["mkultra", "mk-ultra", "mk ultra"],
  "COINTELPRO": ["cointelpro"],
  "Operation Mockingbird": ["operation mockingbird"],
  "Bay of Pigs": ["bay of pigs"],
  "Watergate": ["watergate"],
  "September 11 attacks": ["september 11", "9/11", "9-11 attacks"],
  "Warren Commission": ["warren commission"],
  "Church Committee": ["church committee"],
  "Roswell": ["roswell"],
  "Mexico City": ["mexico city"],
  "Guantanamo": ["guantanamo", "guantánamo"],
};

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const MATCHERS = Object.entries(ENTITIES).map(([canonical, aliases]) => ({
  canonical,
  re: new RegExp(`\\b(?:${aliases.map(esc).join("|")})\\b`, "i"),
}));

function extractEntities(text) {
  const found = [];
  for (const m of MATCHERS) if (m.re.test(text)) found.push(m.canonical);
  return found;
}

// Pull full text from the government source (server-side; no CORS limit here).
// Returns { text, pdfPages } — pdfPages is per-page text with REAL page numbers
// when the PDF rendition was used, else null.
async function fullSource(doc) {
  if (doc.id.startsWith("fr-")) {
    const num = doc.id.slice(3);
    const meta = await fetchText(
      `https://www.federalregister.gov/api/v1/documents/${num}.json?fields[]=raw_text_url`,
    );
    try {
      const url = JSON.parse(meta)?.raw_text_url;
      if (url) {
        const text = await fetchText(url);
        if (text) return { text, pdfPages: null };
      }
    } catch {
      /* ignore */
    }
    return { text: "", pdfPages: null };
  }
  if (doc.id.startsWith("gov-")) {
    const pkg = doc.id.slice(4);
    const html = await fetchText(`https://www.govinfo.gov/content/pkg/${pkg}/html/${pkg}.htm`);
    // GovInfo serves its 404 page with HTTP 200 — detect and treat as no text.
    if (html && !/<title>\s*Page Not Found/i.test(html) && !/Page Not Found \| GovInfo/i.test(html)) {
      return { text: stripHtml(html), pdfPages: null };
    }
    // PDF rendition fallback — slower, but verbatim text with real page numbers.
    const pdfPages = await fetchPdfPages(`https://www.govinfo.gov/content/pkg/${pkg}/pdf/${pkg}.pdf`, {
      maxPages: 25,
    });
    if (pdfPages.length) return { text: pdfPages.map((p) => p.text).join(" "), pdfPages };
    return { text: "", pdfPages: null };
  }
  // PURSUE documents are direct PDFs on war.gov; videos/audio/images have no text.
  if (doc.id.startsWith("pursue-") && /\.pdf$/i.test(doc.originalUrl || "")) {
    const pdfPages = await fetchPdfPages(doc.originalUrl, { maxPages: 25 });
    if (pdfPages.length) return { text: pdfPages.map((p) => p.text).join(" "), pdfPages };
  }
  return { text: "", pdfPages: null };
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: limit }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx], idx);
      }
    }),
  );
  return out;
}

async function main() {
  const docs = JSON.parse(await readFile(FILE, "utf8"));
  console.log(`Enriching ${docs.length} records with full-text extraction…`);

  let withText = 0;
  let withDesc = 0;
  let withPdfPages = 0;
  let done = 0;
  await mapLimit(docs, 6, async (doc) => {
    const { text: ft, pdfPages } = await fullSource(doc);
    if (ft) withText++;
    const blob = `${doc.title} ${doc.summary || ""} ${(doc.tags || []).join(" ")} ${ft}`;
    doc.entities = extractEntities(blob);

    // Descriptions and excerpts are extraction-or-nothing. A failed fetch never
    // downgrades values a previous successful run extracted, and never installs
    // substitute prose.
    const desc = ft ? extractDescription(ft) : "";
    if (desc.length > 120) {
      doc.summary = desc;
      withDesc++;
    }

    if (pdfPages) {
      const pages = excerptPages(pdfPages, { maxPages: 2 });
      if (pages.length) {
        doc.pages = pages;
        delete doc.excerptOnly; // real page numbers — citable
        doc.sourceNote = EXTRACTED_NOTE;
        withPdfPages++;
      }
    } else if (ft) {
      const excerpt = extractExcerpt(ft);
      if (excerpt.length > 300) {
        doc.pages = [{ pageNumber: 1, text: excerpt }];
        doc.excerptOnly = true; // verbatim text, but page boundaries unknown
        doc.sourceNote = EXTRACTED_NOTE;
      }
    }
    if (++done % 40 === 0) console.log(`  …${done}/${docs.length}`);
  });

  await writeFile(FILE, JSON.stringify(docs, null, 2) + "\n");

  // Report real signal.
  const counts = {};
  for (const d of docs) for (const e of d.entities) counts[e] = (counts[e] || 0) + 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const withExcerpt = docs.filter((d) => (d.pages || []).length > 0).length;
  console.log(`\nFull text pulled for ${withText}/${docs.length} records.`);
  console.log(`Extracted descriptions for ${withDesc}, verbatim excerpts for ${withExcerpt} (${withPdfPages} with real PDF page numbers).`);
  console.log(`Records with no extractable text render metadata + source link only.`);
  console.log("Top entities:", top.map(([e, n]) => `${e} (${n})`).join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
