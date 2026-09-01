// Shared text extraction — the machinery behind the site's core guarantee that
// every description and excerpt is the document's own words.
//
// Nothing in here composes prose. Each function either returns text taken
// verbatim from a source document, or returns "" so the caller can render
// nothing at all. There is deliberately no template fallback: an empty result
// must stay empty rather than become a sentence the tool wrote.
//
// Used by scripts/enrich.mjs (ingested corpus) and scripts/extract-curated.mjs
// (the hand-picked landmark records).

import { getDocumentProxy } from "unpdf";

export const clampWord = (s, n) =>
  s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, "") + "…";

export const stripHtml = (s) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

// GPO boilerplate that opens many renditions — skip past it to the substance.
const BOILERPLATE =
  /^(?:\[?\s*)?(?:U\.?S\.? GOVERNMENT (?:PUBLISHING|PRINTING) OFFICE|GPO|FR Doc\.|Federal Register\s*\/|Vol\. \d+|No\. \d+|\[\d+|Pages? \d+|DEPOSITED BY|For sale by|VerDate|Jkt \d+|PO 0+|Frm 0+|Fmt \d+|Sfmt \d+)/i;

// Sentences that state a government document's PURPOSE — committee reports,
// executive orders, laws, and hearings all open their substance with one of these.
const PURPOSE_OPENERS =
  /^(?:The (?:Select |Permanent )?Committee (?:on|met)|This (?:report|Act|act|resolution|document|order|memorandum|proclamation|determination)\b|By the authority vested in me|Memorandum for the|The purpose of|To (?:provide|authorize|amend|direct|require|establish|improve)\b|Resolved, That|Be it enacted|In accordance with|Pursuant to (?:section|the))/;

// Purpose statements live at the top of a document; a match deeper than this many
// substantive sentences is directive language, not the document's purpose.
const PURPOSE_WINDOW = 12;

export function substantiveSentences(fullTextStr) {
  const cleaned = fullTextStr.replace(/\s+/g, " ").trim();
  if (cleaned.length < 200) return [];
  return cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z0-9“"(])/)
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length >= 50 &&
        s.length <= 500 &&
        !BOILERPLATE.test(s) &&
        // Prose only: no JSON/markup junk, no site chrome, no dot leaders,
        // not mostly-uppercase headings.
        !/[{}\\<>]|Page Not Found|Skip to main content/i.test(s) &&
        // Front-matter that survives the sentence splitter: rules of dashes or
        // underscores, print-office lines, "Available on:" listings, part headers.
        !/-{5,}|_{4,}|Printed for the use of|Available on:|GRAPHIC(S)? NOT AVAILABLE|^Part [IVXLC\d]+\b/i.test(s) &&
        s.replace(/[^A-Z]/g, "").length / Math.max(1, s.replace(/[^A-Za-z]/g, "").length) < 0.6 &&
        !/\.{4,}/.test(s),
    );
}

/**
 * The document's own statement of what it is: prefer the first PURPOSE sentence
 * ("The Committee on X, to whom was referred…", "By the authority vested in me…")
 * over masthead front-matter; fall back to the first substantive sentences.
 */
export function extractDescription(fullTextStr) {
  const sentences = substantiveSentences(fullTextStr);
  if (sentences.length === 0) return "";
  const purposeAt = sentences
    .slice(0, PURPOSE_WINDOW)
    .findIndex((s) => PURPOSE_OPENERS.test(s));
  const start = purposeAt >= 0 ? purposeAt : 0;
  return clampWord(sentences.slice(start, start + 3).join(" "), 460);
}

/** First ~1,500 chars of substantive text — becomes the on-site excerpt. */
export function extractExcerpt(fullTextStr) {
  const cleaned = fullTextStr.replace(/\s+/g, " ").trim();
  if (cleaned.length < 300) return "";
  // Start at the first substantive sentence rather than the masthead.
  const desc = extractDescription(fullTextStr);
  const at = desc ? cleaned.indexOf(desc.slice(0, 40)) : -1;
  const body = at > 0 ? cleaned.slice(at) : cleaned;
  return clampWord(body, 1500);
}

export async function fetchText(url, timeoutMs = 15000) {
  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "User-Agent": "JustTheFiles-enrich/0.1 (research tool)" },
    });
    if (!r.ok) return "";
    return await r.text();
  } catch {
    return "";
  }
}

/**
 * Per-page text from a PDF, verbatim. Returns [] on any failure — a source that
 * blocks automated clients yields no excerpt rather than a substitute.
 *
 * Real page numbers are the point: they are what makes a page citation on the
 * site an actual citation into the document rather than a label.
 */
export async function fetchPdfPages(
  url,
  { timeoutMs = 45000, maxPages = 40, parseMs = 60000, maxBytes = 25 * 1024 * 1024 } = {},
) {
  try {
    const r = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        "User-Agent": "JustTheFiles-enrich/0.1 (research tool)",
        Accept: "application/pdf,*/*",
      },
    });
    if (!r.ok) return [];
    const type = r.headers.get("content-type") || "";
    // Congressional PDFs run to thousands of pages. Skip the outliers before
    // spending the download, let alone the parse.
    const declared = Number(r.headers.get("content-length") || 0);
    if (declared > maxBytes) return [];
    const buf = new Uint8Array(await r.arrayBuffer());
    if (buf.byteLength > maxBytes) return [];
    // Trust the bytes, not the header: some gov servers mislabel PDFs.
    if (!(buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46)) {
      if (!/pdf/i.test(type)) return [];
      return [];
    }
    // Parse ONLY the pages we keep. Extracting the whole document and slicing
    // afterwards meant a 600-page hearing cost 600 pages of work to yield 25 —
    // the thing that made this step look hung. Also note the fetch AbortSignal
    // does not cover parsing (it is CPU-bound, not network), so the parse gets
    // its own deadline.
    const pdf = await getDocumentProxy(buf);
    const want = Math.min(pdf.numPages || 0, maxPages);
    if (!want) return [];

    // Deadline is checked in the loop rather than raced against a timer: pdf.js
    // resolves pages as microtasks, which starve a setTimeout macrotask, so a
    // Promise.race deadline silently never fires. Comparing elapsed time between
    // pages is deterministic and needs no timer. It still cannot interrupt one
    // pathological page mid-parse — maxPages is the real bound, this is the
    // backstop. Pages already read are kept: verbatim and short beats nothing.
    const startedAt = Date.now();
    const pages = [];
    for (let n = 1; n <= want; n++) {
      if (Date.now() - startedAt > parseMs) break;
      const content = await (await pdf.getPage(n)).getTextContent();
      const text = content.items
        .map((it) => (typeof it?.str === "string" ? it.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (text) pages.push({ pageNumber: n, text });
    }
    return pages;
  } catch {
    return [];
  }
}

/**
 * Turn per-page PDF text into citable excerpt pages: the first pages that carry
 * substantive prose, each clamped, keeping their REAL page numbers. Sentences
 * are verbatim; clamping only truncates with an ellipsis.
 */
export function excerptPages(pdfPages, { maxPages = 3, clampTo = 1200 } = {}) {
  const out = [];
  for (const p of pdfPages) {
    const sentences = substantiveSentences(p.text);
    if (sentences.length === 0) continue;
    out.push({ pageNumber: p.pageNumber, text: clampWord(sentences.join(" "), clampTo) });
    if (out.length >= maxPages) break;
  }
  return out;
}
