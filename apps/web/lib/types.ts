// Core domain model for Just the Files.
//
// These types are the contract between the UI and the data layer. In Phase 1 the
// data layer is `lib/data.ts` (in-memory fixtures). In Phase 2 the same shapes are
// served by the FastAPI backend over a real Postgres corpus — the UI should not
// need to change when that swap happens. Keep this file backend-agnostic.

export type AgencyCode =
  | "CIA"
  | "FBI"
  | "NSA"
  | "DOD"
  | "DOJ"
  | "ODNI"
  | "AARO"
  | "NARA"
  | "STATE"
  | "USAF"
  | "SENATE"
  | "COMMISSION"
  | "COURT"
  | "WH"
  // Catch-all for ingested records whose originating agency isn't one of the above.
  | "OTHER";

export interface Agency {
  code: AgencyCode;
  /** Full official name, e.g. "Central Intelligence Agency". */
  name: string;
  /** Short label for chips, e.g. "CIA". */
  short: string;
}

export interface DocumentPage {
  pageNumber: number;
  /** Text extracted verbatim from the source document. Never authored or generated. */
  text: string;
}

export interface GovDocument {
  /** Stable slug used in URLs (/documents/<id>). */
  id: string;
  title: string;
  agency: AgencyCode;
  /** Primary topic slug (epstein, uap, jfk, mkultra, sept-11, ...). */
  collection: string;
  /** All topic slugs this document belongs to (cross-agency / cross-topic). */
  topics: string[];
  /** ISO date the document itself was created, when known. */
  docDate: string | null;
  /** Human label when the exact creation date is unknown, e.g. "c. October 1963". */
  docDateLabel?: string;
  /** ISO date the document was released to the public. */
  releaseDate: string;
  /** e.g. "Formerly Top Secret", "Confidential", "Unclassified". Optional for ingested records. */
  classificationEra?: string;
  /** Link to the authoritative government source for this document. */
  originalUrl: string;
  /** Where the record was obtained, e.g. "National Archives Catalog", "CourtListener". */
  sourceName: string;
  pageCount?: number;
  /** OCR confidence, 0..1. Only ever set when real OCR has been run. */
  ocrConfidence?: number;
  language: string;
  /**
   * Description shown with the record. Either extracted from the document's own
   * text (enrich/extract-curated scripts), the source's official abstract or
   * catalog note, or "" — in which case the UI shows metadata only. Never
   * composed by the tool.
   */
  summary: string;
  /** Verbatim excerpts extracted from the source document. Empty when no text could be extracted. */
  pages: DocumentPage[];
  /** Canonical entity names mentioned in the document. */
  entities: string[];
  tags: string[];
  /**
   * True when `pages` holds verbatim extracted text whose page boundaries are
   * unknown (e.g. from an HTML rendition). The UI must not present a page
   * number as a citation for these records.
   */
  excerptOnly?: boolean;
  /** Provenance note about the body text, shown beside excerpts in the viewer. */
  sourceNote?: string;
}

export interface Collection {
  slug: string;
  title: string;
  /** Short, strictly factual description (used in <meta> and cards). */
  blurb: string;
  /** Factual overview paragraphs: what the records are, who released them, when. */
  overview: string[];
  /** Releasing authority and legal basis — rendered under the collection title. */
  provenance: string;
  documentIds: string[];
}

export interface TimelineEvent {
  /** ISO date or a sortable approximation. */
  date: string;
  /** Display label when the date is approximate, e.g. "July 2004". */
  dateLabel?: string;
  title: string;
  /** Source document for this event (every event is citable). */
  documentId: string;
  page?: number;
}

export interface Entity {
  name: string;
  type: "person" | "org" | "place" | "program";
  blurb?: string;
}

export interface GalleryImage {
  /** Stable id, e.g. "loc-2007680837". */
  id: string;
  title: string;
  /** The source archive's own caption/description, when it has one. */
  description?: string;
  date?: string;
  thumbUrl: string;
  imageUrl: string;
  /** The official catalog record for this image. */
  recordUrl: string;
  source: string;
  topics: string[];
}

export interface SearchHit {
  document: GovDocument;
  score: number;
  /** Snippet with matched terms wrapped in <mark>. Pre-escaped, safe to render. */
  snippetHtml: string;
  /** Page the snippet was drawn from — the citation target. */
  page: number;
  matchedTerms: string[];
}

export interface SearchFilters {
  agencies?: AgencyCode[];
  collections?: string[];
  yearFrom?: number;
  yearTo?: number;
}

export interface FacetCount {
  value: string;
  label: string;
  count: number;
}

export interface SearchResponse {
  query: string;
  hits: SearchHit[];
  total: number;
  /** Facet counts computed over the unfiltered result set (for the sidebar). */
  facets: {
    agencies: FacetCount[];
    collections: FacetCount[];
  };
  /** Measured query time, surfaced as "N results in M ms". */
  tookMs: number;
}
