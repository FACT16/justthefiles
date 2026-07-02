// Entity enrichment — the "no separate backend" path.
//
// Runs server-side (locally or in the nightly GitHub Action), where browser CORS
// rules don't apply. For each record it pulls the document's FULL TEXT from the
// government source (Federal Register raw text; GovInfo HTML rendition), scans it
// for a dictionary of notable people/orgs/programs, and writes the matches into
// each record's `entities`. The static site then does connection search over that
// baked data — no always-on server, no database.
//
//   node scripts/enrich.mjs
//
// It reads and rewrites lib/generated-documents.json in place.

import { readFile, writeFile } from "node:fs/promises";

const FILE = new URL("../lib/generated-documents.json", import.meta.url);

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
  "Department of Defense": ["department of defense", "pentagon"],
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

const stripHtml = (s) => s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");

async function fetchText(url, timeoutMs = 15000) {
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

// Pull full text from the government source (server-side; no CORS limit here).
async function fullText(doc) {
  if (doc.id.startsWith("fr-")) {
    const num = doc.id.slice(3);
    const meta = await fetchText(
      `https://www.federalregister.gov/api/v1/documents/${num}.json?fields[]=raw_text_url`,
    );
    try {
      const url = JSON.parse(meta)?.raw_text_url;
      if (url) return await fetchText(url);
    } catch {
      /* ignore */
    }
    return "";
  }
  if (doc.id.startsWith("gov-")) {
    const pkg = doc.id.slice(4);
    const html = await fetchText(
      `https://www.govinfo.gov/content/pkg/${pkg}/html/${pkg}.htm`,
    );
    return html ? stripHtml(html) : "";
  }
  return "";
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
  console.log(`Enriching ${docs.length} records with full-text entity extraction…`);

  let withText = 0;
  let done = 0;
  await mapLimit(docs, 6, async (doc) => {
    const ft = await fullText(doc);
    if (ft) withText++;
    const blob = `${doc.title} ${doc.summary} ${(doc.tags || []).join(" ")} ${ft}`;
    doc.entities = extractEntities(blob);
    if (++done % 40 === 0) console.log(`  …${done}/${docs.length}`);
  });

  await writeFile(FILE, JSON.stringify(docs, null, 2) + "\n");

  // Report real signal.
  const counts = {};
  for (const d of docs) for (const e of d.entities) counts[e] = (counts[e] || 0) + 1;
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const cooccur = (a, b) => docs.filter((d) => d.entities.includes(a) && d.entities.includes(b)).length;
  console.log(`\nFull text pulled for ${withText}/${docs.length} records.`);
  console.log("Top entities:", top.map(([e, n]) => `${e} (${n})`).join(", "));
  console.log("\nSample connections (docs mentioning BOTH):");
  for (const [a, b] of [
    ["Jeffrey Epstein", "Ghislaine Maxwell"],
    ["Jeffrey Epstein", "Donald Trump"],
    ["Central Intelligence Agency", "Federal Bureau of Investigation"],
    ["Lee Harvey Oswald", "Central Intelligence Agency"],
  ]) {
    console.log(`  ${a} + ${b}: ${cooccur(a, b)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
