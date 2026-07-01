// Pure search/scoring helpers used by the data layer. No React, no I/O.
// In Phase 2 the backend does ranking (Postgres FTS + pgvector); this client-side
// scorer is good enough to make the Phase 1 demo feel real over a small corpus.

import type { GovDocument } from "./types";

const STOPWORDS = new Set([
  "the", "a", "an", "of", "and", "or", "to", "in", "on", "for", "is", "are",
  "was", "were", "by", "with", "at", "from", "as", "that", "this", "it",
]);

/** Lowercase, strip punctuation, drop stopwords. Keeps tokens of length >= 2. */
export function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

function countOccurrences(haystack: string, token: string): number {
  if (!token) return 0;
  let count = 0;
  let idx = haystack.indexOf(token);
  while (idx !== -1) {
    count++;
    idx = haystack.indexOf(token, idx + token.length);
  }
  return count;
}

export interface DocScore {
  score: number;
  bestPage: number;
  matchedTerms: string[];
}

/**
 * Field-weighted term-frequency score. Title and entities are weighted highest
 * (a researcher searching an exact name wants it ranked first), then tags,
 * summary, and finally page body text.
 */
export function scoreDocument(doc: GovDocument, tokens: string[]): DocScore {
  if (tokens.length === 0) {
    return { score: 0, bestPage: doc.pages[0]?.pageNumber ?? 1, matchedTerms: [] };
  }

  const title = doc.title.toLowerCase();
  const summary = doc.summary.toLowerCase();
  const tagBlob = doc.tags.join(" ").toLowerCase();
  const entityBlob = doc.entities.join(" ").toLowerCase();

  let score = 0;
  const matched = new Set<string>();

  for (const token of tokens) {
    const inTitle = countOccurrences(title, token);
    const inEntities = countOccurrences(entityBlob, token);
    const inTags = countOccurrences(tagBlob, token);
    const inSummary = countOccurrences(summary, token);

    if (inTitle || inEntities || inTags || inSummary) matched.add(token);
    score += inTitle * 5 + inEntities * 4 + inTags * 3 + inSummary * 2;
  }

  // Page body text contributes, and tells us which page to cite.
  let bestPage = doc.pages[0]?.pageNumber ?? 1;
  let bestPageHits = -1;
  for (const page of doc.pages) {
    const body = page.text.toLowerCase();
    let pageHits = 0;
    for (const token of tokens) {
      const n = countOccurrences(body, token);
      if (n) matched.add(token);
      pageHits += n;
    }
    score += pageHits;
    if (pageHits > bestPageHits) {
      bestPageHits = pageHits;
      bestPage = page.pageNumber;
    }
  }

  // Small bonus when every query term matched somewhere (precision signal).
  if (matched.size === tokens.length) score += 3;

  return { score, bestPage, matchedTerms: [...matched] };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Build a ~240-char snippet centered on the first matched term, with all matched
 * terms wrapped in <mark>. Returned string is HTML-escaped and safe to render.
 */
export function buildSnippet(text: string, tokens: string[], windowSize = 240): string {
  const lower = text.toLowerCase();
  let anchor = -1;
  for (const token of tokens) {
    const idx = lower.indexOf(token);
    if (idx !== -1 && (anchor === -1 || idx < anchor)) anchor = idx;
  }

  let start = 0;
  let end = Math.min(text.length, windowSize);
  if (anchor !== -1) {
    start = Math.max(0, anchor - Math.floor(windowSize / 3));
    end = Math.min(text.length, start + windowSize);
  }

  let slice = text.slice(start, end).trim();
  let html = escapeHtml(slice);

  if (tokens.length) {
    const pattern = tokens.map(escapeRegExp).filter(Boolean).join("|");
    if (pattern) {
      const re = new RegExp(`(${pattern})`, "gi");
      html = html.replace(re, "<mark>$1</mark>");
    }
  }

  const prefix = start > 0 ? "… " : "";
  const suffix = end < text.length ? " …" : "";
  return `${prefix}${html}${suffix}`;
}
