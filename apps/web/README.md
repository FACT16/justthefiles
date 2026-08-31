# Web app

The Next.js frontend for Just the Files — App Router, React 19, Tailwind v4,
built as a static export. See the [root README](../../README.md) for what the
project is and how the ingestion pipeline feeds it.

## Develop

```sh
npm install      # first time only
npm run dev      # http://localhost:3000
```

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Static export to `out/` (every document and topic page pre-rendered) |
| `npm run lint` | ESLint |
| `npm run ingest` | Pull new records from the monitored government sources into `lib/generated-documents.json` |

`scripts/` also holds `enrich.mjs` (full-text entity extraction and extractive
descriptions), `images.mjs` (Library of Congress imagery), and `audit-links.mjs`
(re-verifies every source link). The scheduled workflow runs all four in order.

## Layout

```
app/                     # routes
  page.tsx               # home: search, stats, topics, recent releases
  search/                # faceted results (agency / topic / year)
  documents/[id]/        # document viewer + provenance panel
  topics/[slug]/         # pre-rendered topic pages
  sources/               # monitored release channels + per-source run health
components/              # search bar, result card, provenance panel, timeline
lib/
  types.ts               # domain model
  data.ts                # curated records, merged with the ingested corpus
  sources.ts             # registry of monitored release channels
  search.ts              # scoring + snippet highlighting
  api.ts                 # data accessors — the seam the backend slots into
```

Everything reads data through `lib/api.ts`. Those functions run over the bundled
corpus today and are async so they can become `fetch()` calls against the
backend without touching the UI.
