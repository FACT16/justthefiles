// Ingestion — pull REAL U.S. government / declassified records from public sources and
// write them to lib/generated-documents.json in the GovDocument shape the frontend
// already understands. No backend required.
//
//   npm run ingest
//   DATA_GOV_API_KEY=xxxx npm run ingest      # higher GovInfo/NARA limits
//   NARA_API_KEY=yyyy     npm run ingest      # also pull the National Archives Catalog
//
// Sources:
//   • Internet Archive  — keyless, filtered to U.S.-government material
//   • GovInfo (U.S. GPO) — via api.data.gov (DEMO_KEY by default; set DATA_GOV_API_KEY)
//   • NARA Catalog       — only if NARA_API_KEY is set (NARA issues its own key)

import { writeFile } from "node:fs/promises";

const OUT = new URL("../lib/generated-documents.json", import.meta.url);
const DATA_GOV_KEY = process.env.DATA_GOV_API_KEY || "DEMO_KEY";
const NARA_KEY = process.env.NARA_API_KEY || "";

// `ia` = Internet Archive title query; `q` = keyword query for GovInfo / NARA.
// `slug` must match a collection slug in lib/data.ts.
const TOPICS = [
  { slug: "uap", ia: 'title:(UAP OR UFO OR "unidentified aerial phenomena") AND mediatype:texts', q: "unidentified aerial phenomena UAP UFO" },
  { slug: "jfk", ia: 'title:("Kennedy assassination" OR "Warren Commission" OR Oswald OR "JFK files") AND mediatype:texts', q: "Kennedy assassination Warren Commission Oswald" },
  { slug: "mkultra", ia: 'title:(MKULTRA OR "MK-ULTRA" OR "mind control") AND mediatype:texts', q: "MKULTRA mind control behavioral modification CIA" },
  { slug: "epstein", ia: 'title:(Epstein) AND mediatype:texts', q: "Epstein" },
  { slug: "sept-11", ia: 'title:("9/11 Commission" OR "September 11" OR "Joint Inquiry") AND mediatype:texts', q: "9/11 Commission September 11 terrorist attacks" },
  { slug: "history", ia: 'title:("declassified" OR "Pentagon Papers" OR COINTELPRO OR "Church Committee" OR "Family Jewels") AND mediatype:texts', q: "declassified intelligence Pentagon Papers COINTELPRO Church Committee" },
];

// ── helpers ──────────────────────────────────────────────────────────────────
const asText = (v) => (Array.isArray(v) ? v.join(" ") : typeof v === "string" ? v : "");
const stripHtml = (s) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const clamp = (s, n) => (s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, "") + "…");

function isoDate(s) {
  if (!s) return null;
  const m = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?/.exec(String(s));
  return m ? `${m[1]}-${m[2] ?? "01"}-${m[3] ?? "01"}` : null;
}

function inferAgency(text) {
  const t = text.toLowerCase();
  if (/central intelligence|\bcia\b|crest|rdp/.test(t)) return "CIA";
  if (/federal bureau|\bfbi\b|cointelpro/.test(t)) return "FBI";
  if (/national security agency|\bnsa\b/.test(t)) return "NSA";
  if (/air force|\busaf\b/.test(t)) return "USAF";
  if (/state department|foreign relations|\bfrus\b|diplomatic/.test(t)) return "STATE";
  if (/defense|pentagon|\bdod\b|joint chiefs/.test(t)) return "DOD";
  if (/director of national intelligence|\bodni\b/.test(t)) return "ODNI";
  if (/\bsenate\b|congress|committee|hearing|joint inquiry|\bcdoc\b|\bchrg\b|\bcrpt\b/.test(t)) return "SENATE";
  if (/national archives|\bnara\b/.test(t)) return "NARA";
  if (/commission/.test(t)) return "COMMISSION";
  return "OTHER";
}

async function fetchWithTimeout(url, opts = {}, timeoutMs = 15000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...opts,
      signal: ctrl.signal,
      headers: { "User-Agent": "Unredacted-ingest/0.2 (research demo)", ...(opts.headers || {}) },
    });
  } finally {
    clearTimeout(timer);
  }
}

// ── Internet Archive (keyless), filtered to U.S.-government material ──────────
const FOREIGN = /\b(australian?|brazil(ian)?|canad(a|ian)|british|britain|u\.?k\.?|mexican?|french|belgian?|russian?|chinese|japanese|german|italian|spanish|new zealand|argentin\w*|peruvian?|chilean?|indian|nigerian?|swedish|dutch)\b/i;
const SECONDARY = /\b(MUFON|journal|magazine|newsletter|gazette|channell?ing|comic|novel|fiction)\b/i;
const USGOV = /\b(CIA|FBI|NSA|DIA|Pentagon|Senate|Congress|congressional|federal|United States|U\.?S\.?|declassified|FOIA|Army|Navy|Air Force|White House|State Department|National Archives|NARA|ODNI|AARO|DoD|Defense|Warren Commission|MKULTRA|COINTELPRO)\b/i;

function keepArchive(raw) {
  const title = asText(raw.title);
  if (FOREIGN.test(title) || SECONDARY.test(title)) return false;
  const blob = `${title} ${asText(raw.description)} ${asText(raw.subject)}`;
  return USGOV.test(blob);
}

function archiveUrl(query, rows) {
  const p = new URLSearchParams();
  p.set("q", query);
  for (const f of ["identifier", "title", "description", "year", "date", "publicdate", "subject", "collection", "imagecount"]) {
    p.append("fl[]", f);
  }
  p.append("sort[]", "downloads desc");
  p.set("rows", String(rows));
  p.set("page", "1");
  p.set("output", "json");
  return `https://archive.org/advancedsearch.php?${p.toString()}`;
}

async function ingestArchive(topic) {
  const res = await fetchWithTimeout(archiveUrl(topic.ia, 22));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const docs = (json?.response?.docs ?? []).filter((raw) => raw?.identifier && keepArchive(raw));
  return docs.map((raw) => {
    const title = clamp(stripHtml(asText(raw.title)) || raw.identifier, 180);
    const descFull = stripHtml(asText(raw.description));
    const blob = `${title} ${descFull} ${asText(raw.subject)}`;
    const docDate = isoDate(raw.date) ?? isoDate(raw.year);
    const pageCount = Number(raw.imagecount) > 0 ? Number(raw.imagecount) : undefined;
    const tags = (Array.isArray(raw.subject) ? raw.subject : asText(raw.subject).split(";"))
      .map((s) => stripHtml(String(s)).trim()).filter(Boolean).slice(0, 6);
    return {
      id: `ia-${raw.identifier}`,
      title,
      agency: inferAgency(blob),
      collection: topic.slug,
      topics: [topic.slug],
      docDate,
      releaseDate: isoDate(raw.publicdate) ?? docDate ?? "1970-01-01",
      originalUrl: `https://archive.org/details/${raw.identifier}`,
      sourceName: "Internet Archive",
      pageCount,
      language: "English",
      summary: clamp(descFull || `Archived record: ${title}.`, 360),
      pages: [{ pageNumber: 1, text: clamp(descFull.length > 40 ? descFull : `Archived record: ${title}.`, 1600) }],
      entities: [],
      tags,
      sourceNote: "This is the archived catalog record; the text below is the source archive's description.",
    };
  });
}

// ── GovInfo (U.S. GPO) via api.data.gov ──────────────────────────────────────
async function ingestGovInfo(topic) {
  const res = await fetchWithTimeout(
    `https://api.govinfo.gov/search?api_key=${encodeURIComponent(DATA_GOV_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: topic.q,
        pageSize: 8,
        offsetMark: "*",
        sorts: [{ field: "relevancy", sortOrder: "DESC" }],
      }),
    },
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const results = json?.results ?? [];
  return results
    .map((r) => {
      const packageId = r.packageId || r.granuleId;
      if (!packageId) return null;
      const title = clamp(stripHtml(asText(r.title)) || packageId, 180);
      const coll = r.collectionCode || r.collection || "";
      return {
        id: `gov-${packageId}`,
        title,
        agency: inferAgency(`${title} ${coll}`),
        collection: topic.slug,
        topics: [topic.slug],
        docDate: isoDate(r.dateIssued),
        releaseDate: isoDate(r.dateIssued) ?? isoDate(r.lastModified) ?? "1970-01-01",
        originalUrl: `https://www.govinfo.gov/app/details/${packageId}`,
        sourceName: "GovInfo (U.S. GPO)",
        language: "English",
        summary: clamp(`${title}. A record published by the U.S. Government Publishing Office${coll ? ` (collection ${coll})` : ""}.`, 360),
        pages: [{ pageNumber: 1, text: clamp(`${title}. Published by the U.S. Government Publishing Office${coll ? `, collection ${coll}` : ""}. Read the full document at the source.`, 1600) }],
        entities: [],
        tags: [coll].filter(Boolean),
        sourceNote: "This is the catalog record from GovInfo (U.S. GPO); read the full document at the source.",
      };
    })
    .filter(Boolean);
}

// ── NARA Catalog (only if NARA_API_KEY is set; NARA issues its own key) ───────
async function ingestNara(topic) {
  const url = `https://catalog.archives.gov/api/v2/records/search?q=${encodeURIComponent(topic.q)}&limit=8`;
  const res = await fetchWithTimeout(url, { headers: { "x-api-key": NARA_KEY, Accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const hits = json?.body?.hits?.hits ?? json?.hits?.hits ?? [];
  return hits
    .map((h) => {
      const naId = h._id || h.naId;
      const rec = h.fields || h._source?.record || h.record || h._source || {};
      if (!naId) return null;
      const title = clamp(stripHtml(asText(rec.title)) || `NARA record ${naId}`, 180);
      return {
        id: `nara-${naId}`,
        title,
        agency: inferAgency(`${title} ${asText(rec.referenceUnits || rec.creators)}`),
        collection: topic.slug,
        topics: [topic.slug],
        docDate: isoDate(asText(rec.productionDates || rec.coverageStartDate)),
        releaseDate: isoDate(asText(rec.productionDates)) ?? "1970-01-01",
        originalUrl: `https://catalog.archives.gov/id/${naId}`,
        sourceName: "National Archives Catalog",
        language: "English",
        summary: clamp(stripHtml(asText(rec.scopeAndContentNote)) || `${title}. A record held by the U.S. National Archives.`, 360),
        pages: [{ pageNumber: 1, text: clamp(stripHtml(asText(rec.scopeAndContentNote)) || `${title}. Held by the U.S. National Archives.`, 1600) }],
        entities: [],
        tags: [],
        sourceNote: "This is the catalog record from the U.S. National Archives; read the full document at the source.",
      };
    })
    .filter(Boolean);
}

// ── orchestrate ──────────────────────────────────────────────────────────────
async function main() {
  console.log("Ingesting real U.S. government records…");
  console.log(`  GovInfo key: ${DATA_GOV_KEY === "DEMO_KEY" ? "DEMO_KEY (low limits — set DATA_GOV_API_KEY for more)" : "custom"}`);
  console.log(`  NARA: ${NARA_KEY ? "enabled" : "skipped (set NARA_API_KEY to enable)"}\n`);

  const byId = new Map();
  const addAll = (docs, source, slug) => {
    let added = 0;
    for (const doc of docs) {
      if (!doc?.id) continue;
      if (byId.has(doc.id)) {
        const existing = byId.get(doc.id);
        if (!existing.topics.includes(slug)) existing.topics.push(slug);
        continue;
      }
      byId.set(doc.id, doc);
      added++;
    }
    return added;
  };

  for (const topic of TOPICS) {
    const sources = [["IA", ingestArchive], ["GovInfo", ingestGovInfo]];
    if (NARA_KEY) sources.push(["NARA", ingestNara]);
    const counts = [];
    for (const [name, fn] of sources) {
      try {
        const docs = await fn(topic);
        counts.push(`${name} +${addAll(docs, name, topic.slug)}`);
      } catch (err) {
        counts.push(`${name} FAIL(${err.message})`);
      }
      await new Promise((r) => setTimeout(r, 400));
    }
    console.log(`  ${topic.slug.padEnd(8)} ${counts.join("  ")}`);
  }

  const out = [...byId.values()];
  await writeFile(OUT, JSON.stringify(out, null, 2) + "\n");
  console.log(`\nWrote ${out.length} records to lib/generated-documents.json`);
  if (out.length === 0) console.warn("No records ingested — sources may be unreachable from this environment.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
