// Verbatim text for the curated landmark records in lib/data.ts.
//
// Curated records carry no authored body text — none, ever. This script fetches
// each record's official source document, extracts per-page text verbatim, and
// writes lib/generated-curated-text.json, which lib/data.ts merges in by id.
// A record whose source cannot be fetched (some FOIA reading rooms block
// automated clients) or whose URL is a release/collection landing page rather
// than a single document simply gets NO excerpt: the site shows its metadata,
// catalog note, and source link.
//
//   node scripts/extract-curated.mjs
//
// Runs in the scheduled workflow between ingest and enrich.

import { readFile, writeFile } from "node:fs/promises";
import { excerptPages, extractDescription, fetchPdfPages } from "./text-extract.mjs";

const DATA = new URL("../lib/data.ts", import.meta.url);
const OUT = new URL("../lib/generated-curated-text.json", import.meta.url);

const EXTRACTED_NOTE =
  "Verbatim text extracted from the official document as published by the source; read the full document at the source.";

// Direct-document URLs where the record's originalUrl is a details/landing page.
// These are URL derivations (the same document at its machine-readable rendition),
// never substitute sources.
const DIRECT_SOURCES = {
  "aaro-historical-record-v1": [
    "https://www.govinfo.gov/content/pkg/GOVPUB-PREX28-PURL-gpo223327/pdf/GOVPUB-PREX28-PURL-gpo223327.pdf",
  ],
  "sept11-commission-report": [
    "https://www.govinfo.gov/content/pkg/GPO-911REPORT/pdf/GPO-911REPORT.pdf",
  ],
  "roswell-case-closed": [
    // GAO serves report PDFs under /assets/ in a couple of historical layouts.
    "https://www.gao.gov/assets/nsiad-95-187.pdf",
    "https://www.gao.gov/assets/230/221605.pdf",
  ],
};

/** id -> originalUrl for every curated record, parsed from lib/data.ts. */
async function curatedSources() {
  const src = await readFile(DATA, "utf8");
  const start = src.indexOf("const CURATED_DOCUMENTS");
  const end = src.indexOf("// Curated demo records", start) === -1
    ? src.indexOf("export const COLLECTIONS", start)
    : src.indexOf("// Curated demo records", start);
  const body = src.slice(start, end === -1 ? undefined : end);
  const out = [];
  const idRe = /id:\s*"([^"]+)"/g;
  let m;
  const ids = [];
  while ((m = idRe.exec(body))) ids.push({ id: m[1], at: m.index });
  for (let i = 0; i < ids.length; i++) {
    const chunk = body.slice(ids[i].at, ids[i + 1]?.at);
    const u = /originalUrl:\s*\n?\s*"([^"]+)"/.exec(chunk);
    if (u) out.push({ id: ids[i].id, originalUrl: u[1] });
  }
  return out;
}

async function main() {
  const sources = await curatedSources();
  if (sources.length < 10) {
    console.error(`Parsed only ${sources.length} curated records from lib/data.ts — parser out of sync; refusing to run.`);
    process.exit(1);
  }
  console.log(`Extracting verbatim text for ${sources.length} curated records…`);

  // Start from the previous snapshot so a temporarily unreachable source never
  // erases text a prior run extracted.
  let previous = {};
  try {
    previous = JSON.parse(await readFile(OUT, "utf8"));
  } catch {
    /* first run */
  }
  const out = { ...previous };

  let extracted = 0;
  for (const { id, originalUrl } of sources) {
    const candidates = DIRECT_SOURCES[id] ?? (/\.pdf(?:[?#]|$)/i.test(originalUrl) ? [originalUrl] : []);
    if (candidates.length === 0) {
      console.log(`  ${id.padEnd(34)} landing page — no single document to extract`);
      continue;
    }
    let pdfPages = [];
    let used = "";
    for (const url of candidates) {
      pdfPages = await fetchPdfPages(url, { maxPages: 30 });
      if (pdfPages.length) {
        used = url;
        break;
      }
    }
    if (!pdfPages.length) {
      console.log(`  ${id.padEnd(34)} FAIL (source unreachable or not a PDF)${out[id] ? " — kept previous extraction" : ""}`);
      continue;
    }
    const pages = excerptPages(pdfPages, { maxPages: 3, clampTo: 1200 });
    if (!pages.length) {
      console.log(`  ${id.padEnd(34)} no substantive text found`);
      continue;
    }
    const desc = extractDescription(pdfPages.map((p) => p.text).join(" "));
    out[id] = {
      ...(desc.length > 120 ? { summary: desc } : {}),
      pages,
      sourceNote: EXTRACTED_NOTE,
    };
    extracted++;
    console.log(`  ${id.padEnd(34)} +${pages.length} pages (${used.split("/").pop()})`);
    await new Promise((r) => setTimeout(r, 800));
  }

  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nWrote extractions for ${Object.keys(out).length} records (${extracted} updated this run) to lib/generated-curated-text.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
