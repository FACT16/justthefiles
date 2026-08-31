// Curated landmark records + collection definitions — the hand-maintained layer
// merged with the ingested corpus.
//
// INTEGRITY NOTE: Curated records carry real metadata (title, agency, dates,
// source URL, classification) and a short factual catalog note. They carry NO
// authored body text: excerpts come exclusively from generated-curated-text.json,
// verbatim extractions produced by scripts/extract-curated.mjs from each record's
// official source. A record whose source yields no text shows metadata and the
// source link only.

import type {
  Agency,
  AgencyCode,
  Collection,
  DocumentPage,
  Entity,
  GovDocument,
  TimelineEvent,
} from "./types";
import generatedRaw from "./generated-documents.json";
import curatedTextRaw from "./generated-curated-text.json";

export const AGENCIES: Record<AgencyCode, Agency> = {
  CIA: { code: "CIA", name: "Central Intelligence Agency", short: "CIA" },
  FBI: { code: "FBI", name: "Federal Bureau of Investigation", short: "FBI" },
  NSA: { code: "NSA", name: "National Security Agency", short: "NSA" },
  DOD: { code: "DOD", name: "U.S. Department of Defense", short: "DoD" },
  DOJ: { code: "DOJ", name: "U.S. Department of Justice", short: "DOJ" },
  ODNI: { code: "ODNI", name: "Office of the Director of National Intelligence", short: "ODNI" },
  AARO: { code: "AARO", name: "All-domain Anomaly Resolution Office", short: "AARO" },
  NARA: { code: "NARA", name: "National Archives and Records Administration", short: "NARA" },
  STATE: { code: "STATE", name: "U.S. Department of State", short: "State Dept." },
  USAF: { code: "USAF", name: "United States Air Force", short: "USAF" },
  SENATE: { code: "SENATE", name: "United States Senate", short: "U.S. Senate" },
  COMMISSION: { code: "COMMISSION", name: "Independent Federal Commission", short: "Commission" },
  COURT: { code: "COURT", name: "U.S. Federal Courts", short: "U.S. Courts" },
  WH: { code: "WH", name: "The White House", short: "WH" },
  OTHER: { code: "OTHER", name: "U.S. Government", short: "GOV" },
};

const CURATED_DOCUMENTS: GovDocument[] = [
  // ── Epstein ────────────────────────────────────────────────────────────────
  {
    id: "epstein-giuffre-maxwell-unsealed",
    title: "Giuffre v. Maxwell — Unsealed Court Records (Docket 1:15-cv-07433)",
    agency: "COURT",
    collection: "epstein",
    topics: ["epstein"],
    docDate: "2024-01-03",
    releaseDate: "2024-01-03",
    classificationEra: "Court-sealed (unsealed by order)",
    originalUrl: "https://www.courtlistener.com/docket/4355835/giuffre-v-maxwell/",
    sourceName: "CourtListener (Free Law Project)",
    pageCount: 943,
    language: "English",
    summary:
      "Documents unsealed by the U.S. District Court for the Southern District of New York in the civil defamation case Giuffre v. Maxwell, beginning January 2024. The release comprises depositions, motions, and exhibits previously filed under seal.",
    pages: [],
    entities: ["Jeffrey Epstein", "Ghislaine Maxwell", "Virginia Giuffre"],
    tags: ["court records", "depositions", "SDNY", "civil litigation"],
  },
  {
    id: "epstein-doj-phase-1",
    title: "FBI Records: Jeffrey Epstein (The Vault)",
    agency: "FBI",
    collection: "epstein",
    topics: ["epstein"],
    docDate: "2025-02-27",
    releaseDate: "2025-02-27",
    classificationEra: "Released (FOIA)",
    originalUrl: "https://vault.fbi.gov/jeffrey-epstein",
    sourceName: "FBI Records: The Vault",
    pageCount: 341,
    language: "English",
    summary:
      "The FBI's released records on Jeffrey Epstein, published through the Bureau's FOIA reading room (The Vault). The files include investigative records, portions of which remain redacted to protect victims and uncharged third parties.",
    pages: [],
    entities: ["Jeffrey Epstein", "Ghislaine Maxwell"],
    tags: ["flight logs", "evidence log", "redactions", "FOIA"],
  },

  // ── UAP / UFO ────────────────────────────────────────────────────────────────
  {
    id: "uap-odni-prelim-2021",
    title: "Preliminary Assessment: Unidentified Aerial Phenomena",
    agency: "ODNI",
    collection: "uap",
    topics: ["uap"],
    docDate: "2021-06-25",
    releaseDate: "2021-06-25",
    classificationEra: "Unclassified",
    originalUrl:
      "https://www.dni.gov/files/ODNI/documents/assessments/Prelimary-Assessment-UAP-20210625.pdf",
    sourceName: "Office of the Director of National Intelligence",
    pageCount: 9,
    language: "English",
    summary:
      "The Office of the Director of National Intelligence's preliminary assessment of Unidentified Aerial Phenomena, prepared for Congress in June 2021. It reviewed 144 reports from U.S. government sources between 2004 and 2021 and found most remained unexplained for lack of data.",
    pages: [],
    entities: ["Office of the Director of National Intelligence"],
    tags: ["UAP", "UFO", "congressional report", "national security"],
  },
  {
    id: "uap-odni-annual-2022",
    title: "2022 Annual Report on Unidentified Aerial Phenomena",
    agency: "ODNI",
    collection: "uap",
    topics: ["uap"],
    docDate: "2023-01-12",
    releaseDate: "2023-01-12",
    classificationEra: "Unclassified (declassified summary)",
    originalUrl:
      "https://www.dni.gov/files/ODNI/documents/assessments/Unclassified-2022-Annual-Report-UAP.pdf",
    sourceName: "Office of the Director of National Intelligence",
    pageCount: 12,
    language: "English",
    summary:
      "The unclassified 2022 annual report on UAP, produced by ODNI with the All-domain Anomaly Resolution Office. It reported a total of 510 catalogued UAP reports, many of which were attributed to balloons or balloon-like entities, while others remained uncharacterized.",
    pages: [],
    entities: ["Office of the Director of National Intelligence", "All-domain Anomaly Resolution Office"],
    tags: ["UAP", "annual report", "AARO"],
  },
  {
    id: "aaro-historical-record-v1",
    title: "Report on the Historical Record of U.S. Government Involvement with UAP, Volume 1",
    agency: "AARO",
    collection: "uap",
    topics: ["uap"],
    docDate: "2024-02-29",
    releaseDate: "2024-03-08",
    classificationEra: "Unclassified",
    originalUrl: "https://www.govinfo.gov/app/details/GOVPUB-PREX28-PURL-gpo223327",
    sourceName: "GovInfo (U.S. GPO)",
    pageCount: 63,
    language: "English",
    summary:
      "The first volume of the All-domain Anomaly Resolution Office's review of U.S. government involvement with UAP from 1945 to 2023. It found no empirical evidence that the U.S. government or private industry had access to extraterrestrial technology.",
    pages: [],
    entities: ["All-domain Anomaly Resolution Office"],
    tags: ["UAP", "historical record", "reverse engineering claims"],
  },
  {
    id: "uap-pursue-program",
    title: "PURSUE — Presidential Unsealing and Reporting System for UAP Encounters (war.gov/UFO)",
    agency: "DOD",
    collection: "uap",
    topics: ["uap"],
    docDate: "2026-05-08",
    docDateLabel: "rolling releases since May 2026",
    releaseDate: "2026-05-08",
    classificationEra: "Declassified (rolling releases)",
    originalUrl: "https://www.war.gov/ufo/",
    sourceName: "U.S. Department of War (war.gov/UFO)",
    language: "English",
    summary:
      "The Department of War's UAP disclosure portal, launched May 8, 2026 at the President's direction. A multiagency effort — Pentagon, CIA, FBI, NASA, State, and Energy Department — releases declassified UAP documents, videos, audio, and images in tranches every few weeks. Four tranches were published through July 10, 2026, beginning with 162 files.",
    pages: [],
    entities: ["U.S. Department of Defense", "Central Intelligence Agency", "Federal Bureau of Investigation"],
    tags: ["UAP", "PURSUE", "declassification", "rolling release"],
  },
  {
    id: "uap-nara-rg615",
    title: "Unidentified Anomalous Phenomena Records Collection (Record Group 615)",
    agency: "NARA",
    collection: "uap",
    topics: ["uap"],
    docDate: null,
    docDateLabel: "rolling transfers since 2025",
    releaseDate: "2025-04-24",
    classificationEra: "Released (2024 NDAA, Pub. L. 118-31)",
    originalUrl: "https://www.archives.gov/research/topics/uaps/rg-615",
    sourceName: "National Archives and Records Administration",
    language: "English",
    summary:
      "The National Archives' UAP Records Collection, created under the 2024 National Defense Authorization Act, which requires every federal agency to transfer its UAP records to NARA. The first tranche — records from ODNI, the Office of the Secretary of Defense, the FAA, and the Nuclear Regulatory Commission — was released in April 2025, with additions on a rolling basis through the National Archives Catalog.",
    pages: [],
    entities: ["Office of the Director of National Intelligence", "U.S. Department of Defense"],
    tags: ["UAP", "RG 615", "records collection", "NDAA"],
  },
  {
    id: "roswell-case-closed",
    title: "GAO: Search for Records Concerning the 1947 Crash Near Roswell",
    agency: "OTHER",
    collection: "uap",
    topics: ["uap"],
    docDate: "1995-07-28",
    releaseDate: "1995-07-28",
    classificationEra: "Unclassified",
    originalUrl: "https://www.gao.gov/products/nsiad-95-187",
    sourceName: "U.S. Government Accountability Office (GAO)",
    pageCount: 20,
    language: "English",
    summary:
      "A U.S. Government Accountability Office report, requested by Congress, documenting a search for federal records concerning the 1947 crash near Roswell, New Mexico — which records were located and which were reported to have been destroyed.",
    pages: [],
    entities: ["United States Air Force", "Roswell, New Mexico"],
    tags: ["Roswell", "Project Mogul", "UAP"],
  },

  // ── JFK ────────────────────────────────────────────────────────────────────
  {
    id: "jfk-2025-release",
    title: "JFK Assassination Records — 2025 Release",
    agency: "NARA",
    collection: "jfk",
    topics: ["jfk"],
    docDate: "2025-03-18",
    releaseDate: "2025-03-18",
    classificationEra: "Formerly classified (released in full)",
    originalUrl: "https://www.archives.gov/research/jfk/release-2025",
    sourceName: "National Archives Catalog",
    pageCount: 80000,
    language: "English",
    summary:
      "The 2025 release of records in the President John F. Kennedy Assassination Records Collection by the National Archives, comprising tens of thousands of pages of previously redacted CIA, FBI, and State Department documents made public in full.",
    pages: [],
    entities: ["Lee Harvey Oswald", "Central Intelligence Agency", "Federal Bureau of Investigation"],
    tags: ["JFK", "assassination records", "2025 release"],
  },

  // ── MKUltra ───────────────────────────────────────────────────────────────
  {
    id: "mkultra-senate-1977",
    title:
      "Project MKULTRA, the CIA's Program of Research in Behavioral Modification (Joint Senate Hearing)",
    agency: "SENATE",
    collection: "mkultra",
    topics: ["mkultra"],
    docDate: "1977-08-03",
    releaseDate: "1977-08-03",
    classificationEra: "Hearing record (public)",
    originalUrl: "https://www.intelligence.senate.gov/sites/default/files/hearings/95mkultra.pdf",
    sourceName: "U.S. Senate Select Committee on Intelligence",
    pageCount: 171,
    language: "English",
    summary:
      "The published record of the 1977 joint hearing before the Senate Select Committee on Intelligence and the Subcommittee on Health concerning Project MKUltra, the CIA's program of research into behavioral modification, including the use of chemical and biological materials.",
    pages: [],
    entities: ["MKUltra", "Sidney Gottlieb", "Central Intelligence Agency"],
    tags: ["MKUltra", "behavioral modification", "Senate hearing"],
  },
  {
    id: "mkultra-subprojects-foia",
    title: "MKULTRA Subproject Files (FOIA Reading Room Collection)",
    agency: "CIA",
    collection: "mkultra",
    topics: ["mkultra"],
    docDate: "1953-04-13",
    docDateLabel: "1953–1973",
    releaseDate: "2018-01-18",
    classificationEra: "Formerly Secret",
    originalUrl: "https://www.cia.gov/readingroom/collection/mkultra",
    sourceName: "CIA FOIA Electronic Reading Room",
    pageCount: 4358,
    language: "English",
    summary:
      "The Central Intelligence Agency's FOIA reading-room collection of surviving MKUltra subproject financial and administrative records, released after litigation. Many records are heavily redacted and consist of accounting and grant documents rather than research findings.",
    pages: [],
    entities: ["MKUltra", "Sidney Gottlieb", "Central Intelligence Agency"],
    tags: ["MKUltra", "subprojects", "FOIA", "redactions"],
  },

  // ── September 11 ─────────────────────────────────────────────────────────────
  {
    id: "sept11-commission-report",
    title:
      "Final Report of the National Commission on Terrorist Attacks Upon the United States",
    agency: "COMMISSION",
    collection: "sept-11",
    topics: ["sept-11"],
    docDate: "2004-07-22",
    releaseDate: "2004-07-22",
    classificationEra: "Unclassified",
    originalUrl: "https://www.govinfo.gov/app/details/GPO-911REPORT",
    sourceName: "U.S. Government Publishing Office (govinfo)",
    pageCount: 585,
    language: "English",
    summary:
      "The final report of the bipartisan 9/11 Commission, presenting its findings on the September 11, 2001 terrorist attacks, the failures that preceded them, and recommendations to guard against future attacks.",
    pages: [],
    entities: ["Federal Bureau of Investigation", "Central Intelligence Agency"],
    tags: ["9/11", "commission report", "counterterrorism"],
  },

  // ── Historical depth (cross-topic) ───────────────────────────────────────────
  {
    id: "frus-iran-1953",
    title: "Foreign Relations of the United States: Iran, 1951–1954 (Operation TPAJAX)",
    agency: "STATE",
    collection: "history",
    topics: ["history", "mkultra"],
    docDate: "2017-06-15",
    docDateLabel: "covering 1951–1954",
    releaseDate: "2017-06-15",
    classificationEra: "Formerly classified (declassified)",
    originalUrl: "https://history.state.gov/historicaldocuments/frus1951-54Iran",
    sourceName: "U.S. Department of State, Office of the Historian",
    pageCount: 1007,
    language: "English",
    summary:
      "A retrospective volume in the State Department's Foreign Relations of the United States series documenting U.S. and U.K. involvement in the 1953 coup that removed Iranian Prime Minister Mohammad Mosaddegh, including the CIA's role in Operation TPAJAX.",
    pages: [],
    entities: ["Central Intelligence Agency", "Mohammad Mosaddegh", "Kermit Roosevelt", "Tehran", "Operation Ajax (TPAJAX)"],
    tags: ["Iran", "1953 coup", "covert action", "FRUS"],
  },
  {
    id: "cia-family-jewels",
    title: "Family Jewels — CIA Records of Questionable Activities",
    agency: "CIA",
    collection: "history",
    topics: ["history", "mkultra"],
    docDate: "1973-05-16",
    releaseDate: "2007-06-25",
    classificationEra: "Formerly Secret",
    originalUrl: "https://www.cia.gov/readingroom/collection/family-jewels",
    sourceName: "CIA FOIA Electronic Reading Room",
    pageCount: 702,
    language: "English",
    summary:
      "A compilation of internal CIA reports, assembled in 1973 at the director's request, cataloguing agency activities that potentially violated its charter — including surveillance of journalists, mail opening, and assassination planning. Released in 2007.",
    pages: [],
    entities: ["Central Intelligence Agency", "Richard Helms", "Operation Mockingbird"],
    tags: ["Family Jewels", "surveillance", "CIA charter"],
  },
  {
    id: "pentagon-papers",
    title: "Report of the Office of the Secretary of Defense Vietnam Task Force (Pentagon Papers)",
    agency: "DOD",
    collection: "history",
    topics: ["history"],
    docDate: "1969-01-15",
    docDateLabel: "completed 1969",
    releaseDate: "2011-06-13",
    classificationEra: "Formerly Top Secret",
    originalUrl: "https://www.archives.gov/research/pentagon-papers",
    sourceName: "National Archives",
    pageCount: 7000,
    language: "English",
    summary:
      "The Department of Defense's classified history of U.S. political and military involvement in Vietnam from 1945 to 1967, commissioned in 1967 and fully declassified by the National Archives in 2011 on the 40th anniversary of its first publication.",
    pages: [],
    entities: ["U.S. Department of Defense"],
    tags: ["Vietnam", "Pentagon Papers", "declassified history"],
  },
  {
    id: "church-committee-report",
    title: "Church Committee — Final Report on Intelligence Activities and the Rights of Americans",
    agency: "SENATE",
    collection: "history",
    topics: ["history", "mkultra"],
    docDate: "1976-04-26",
    releaseDate: "1976-04-26",
    classificationEra: "Public report",
    originalUrl:
      "https://www.senate.gov/about/powers-procedures/investigations/church-committee.htm",
    sourceName: "U.S. Senate",
    pageCount: 989,
    language: "English",
    summary:
      "The final report of the U.S. Senate Select Committee to Study Governmental Operations with Respect to Intelligence Activities (the Church Committee), documenting abuses by intelligence agencies, including COINTELPRO and surveillance of American citizens.",
    pages: [],
    entities: ["Federal Bureau of Investigation", "Central Intelligence Agency", "COINTELPRO", "Martin Luther King Jr."],
    tags: ["Church Committee", "COINTELPRO", "oversight"],
  },
  {
    id: "cointelpro-mlk-2025",
    title: "FBI Records: Martin Luther King, Jr. (The Vault)",
    agency: "FBI",
    collection: "history",
    topics: ["history"],
    docDate: "2025-07-21",
    releaseDate: "2025-07-21",
    classificationEra: "Released (FOIA)",
    originalUrl: "https://vault.fbi.gov/martin-luther-king-jr",
    sourceName: "FBI Records: The Vault",
    pageCount: 243000,
    language: "English",
    summary:
      "The FBI's records on Dr. Martin Luther King, Jr., published through the Bureau's FOIA reading room (The Vault) — memoranda, field reports, and surveillance summaries produced under the Bureau's domestic intelligence programs.",
    pages: [],
    entities: ["Federal Bureau of Investigation", "Martin Luther King Jr.", "J. Edgar Hoover", "COINTELPRO"],
    tags: ["MLK", "FBI", "surveillance", "2025 release"],
  },
];

// Curated records get their body text ONLY from verbatim extractions
// (scripts/extract-curated.mjs → generated-curated-text.json). No extraction, no
// excerpt — never substitute prose.
const CURATED_TEXT = curatedTextRaw as Record<
  string,
  { summary?: string; pages: DocumentPage[]; sourceNote: string }
>;
const CURATED_WITH_TEXT: GovDocument[] = CURATED_DOCUMENTS.map((doc) => {
  const extracted = CURATED_TEXT[doc.id];
  return extracted
    ? {
        ...doc,
        summary: extracted.summary ?? doc.summary,
        pages: extracted.pages,
        sourceNote: extracted.sourceNote,
      }
    : doc;
});

// Curated records (above) + real records pulled by `npm run ingest` (written to
// generated-documents.json). Ingested records are merged in, skipping any id that a
// curated record already covers.
const GENERATED_DOCUMENTS = generatedRaw as unknown as GovDocument[];
const curatedIds = new Set(CURATED_DOCUMENTS.map((d) => d.id));

export const DOCUMENTS: GovDocument[] = [
  ...CURATED_WITH_TEXT,
  ...GENERATED_DOCUMENTS.filter((d) => d && d.id && !curatedIds.has(d.id)),
];

export const COLLECTIONS: Collection[] = [
  {
    slug: "latest",
    title: "Latest Releases",
    blurb:
      "Documents recently published by official U.S. government channels — committee reports, hearings, public laws, and declassification releases, as they are added to the record.",
    provenance:
      "Published by the U.S. Government Publishing Office (govinfo.gov) and the Department of War (war.gov/UFO). Updated automatically on a schedule.",
    overview: [
      "This feed lists documents as the monitored release channels publish them: additions to the official record by the U.S. Government Publishing Office — committee reports, hearing transcripts, and newly enacted public laws — and files posted to the Department of War's PURSUE portal (war.gov/UFO).",
      "Every entry links to the official record at its source.",
    ],
    documentIds: [],
  },
  {
    slug: "epstein",
    title: "Epstein Case Records",
    blurb:
      "Records from the federal proceedings and releases concerning Jeffrey Epstein: court filings unsealed in Giuffre v. Maxwell, FBI records released under FOIA, and congressional publications that reference the case.",
    provenance:
      "Released by the U.S. District Court for the Southern District of New York (by court order, 2024), the FBI's FOIA reading room (2025), and the U.S. Government Publishing Office.",
    overview: [
      "The public record on Jeffrey Epstein comes from two main streams: civil litigation in federal court, and records released by the Department of Justice. The largest court tranche was unsealed in the Southern District of New York in the case Giuffre v. Maxwell beginning in January 2024.",
      "These materials are primary sources — depositions, exhibits, evidence logs, and court orders. Many entries are redacted to protect victims and uncharged third parties. Where a name appears, it does not by itself indicate wrongdoing.",
    ],
    documentIds: ["epstein-giuffre-maxwell-unsealed", "epstein-doj-phase-1"],
  },
  {
    slug: "uap",
    title: "UAP Records",
    blurb:
      "Official U.S. government records on unidentified anomalous phenomena: the National Archives' UAP Records Collection (RG 615), files released on war.gov/UFO, ODNI reports to Congress, and AARO's historical review.",
    provenance:
      "Released by the Department of War (PURSUE, war.gov/UFO), the National Archives (Record Group 615, under §§1841–1843 of the 2024 NDAA), ODNI, and AARO.",
    overview: [
      "Since 2021, the U.S. government has published an official record on unidentified anomalous phenomena. The Office of the Director of National Intelligence issued a preliminary assessment in June 2021 and annual reports thereafter. In 2024, the All-domain Anomaly Resolution Office published the first volume of a historical review covering 1945 to 2023, which found no empirical evidence of extraterrestrial technology.",
      "Two standing release channels now operate. Under the 2024 NDAA, federal agencies transfer their UAP records to the National Archives' UAP Records Collection (Record Group 615), released on a rolling basis since April 2025. And since May 8, 2026, the Department of War's PURSUE portal (war.gov/UFO) has published tranches of declassified documents, videos, audio, and images. Both channels are ingested automatically, so new files appear here as they are released.",
    ],
    documentIds: [
      "uap-pursue-program",
      "uap-nara-rg615",
      "uap-odni-prelim-2021",
      "uap-odni-annual-2022",
      "aaro-historical-record-v1",
      "roswell-case-closed",
    ],
  },
  {
    slug: "jfk",
    title: "JFK Assassination Records Collection",
    blurb:
      "The President John F. Kennedy Assassination Records Collection at the National Archives, including the 2025 release of previously withheld CIA and FBI files.",
    provenance:
      "Maintained and released by the National Archives under the President John F. Kennedy Assassination Records Collection Act of 1992. Latest major release: March 2025.",
    overview: [
      "The JFK Assassination Records Collection is maintained by the National Archives under the JFK Records Act. A release in 2025 made public tens of thousands of pages previously withheld or redacted.",
      "The collection draws from the CIA, FBI, and State Department, and includes cables concerning Lee Harvey Oswald's reported activity in Mexico City in the weeks before the assassination.",
    ],
    documentIds: ["jfk-2025-release"],
  },
  {
    slug: "mkultra",
    title: "MKUltra Records",
    blurb:
      "Records of the CIA's MKUltra program: the 1977 Senate hearing record and the surviving subproject files released through the CIA's FOIA reading room.",
    provenance:
      "Released through the CIA FOIA Electronic Reading Room and the published record of the U.S. Senate. Surviving files date from 1953–1973.",
    overview: [
      "MKUltra was a CIA program researching behavioral modification, including chemical and biological materials. Most records were destroyed in 1973, but financial files discovered later allowed a partial reconstruction, examined in a 1977 Senate hearing.",
      "The surviving subproject files, released through the CIA's FOIA reading room, are largely administrative and accounting records and are heavily redacted.",
    ],
    documentIds: ["mkultra-senate-1977", "mkultra-subprojects-foia", "church-committee-report"],
  },
  {
    slug: "sept-11",
    title: "September 11 Records",
    blurb:
      "The 9/11 Commission's final report and related congressional records, including the section of the Joint Inquiry declassified in 2016.",
    provenance:
      "Published by the National Commission on Terrorist Attacks Upon the United States (2004) and the U.S. Government Publishing Office. Joint Inquiry section declassified 2016.",
    overview: [
      "The bipartisan 9/11 Commission published its final report in July 2004. A 28-page section of the earlier congressional Joint Inquiry, concerning possible foreign support for some hijackers, remained classified until 2016.",
      "Both are primary sources available in full. The Commission described its central finding as a 'failure of imagination' across the national security establishment.",
    ],
    documentIds: ["sept11-commission-report"],
  },
  {
    slug: "executive-orders",
    title: "Executive Orders & Presidential Documents",
    blurb:
      "Executive orders, proclamations, and presidential memoranda as published in the Federal Register, the official daily journal of the U.S. government.",
    provenance:
      "Published in the Federal Register by the Office of the Federal Register (NARA). Updated as new documents are published.",
    overview: [
      "Executive orders, proclamations, and memoranda are the President's direct instructions to the federal government. Each is published in the Federal Register — the official daily journal of the U.S. government — as it takes effect.",
      "This collection lists presidential documents as they are published, each linked to its Federal Register record.",
    ],
    documentIds: [],
  },
  {
    slug: "fbi-files",
    title: "FBI Records",
    blurb:
      "Federal Bureau of Investigation records released under FOIA and through the National Archives — investigative files, surveillance records, and closed-case documents.",
    provenance:
      "Released by the FBI through its FOIA reading room (The Vault) and the National Archives.",
    overview: [
      "The FBI has released large volumes of records through its FOIA program and the National Archives, covering historical investigations, domestic intelligence programs, and closed cases.",
      "These files range from field-office memoranda to surveillance summaries, and many are heavily redacted. Each links to the original release.",
    ],
    documentIds: [],
  },
  {
    slug: "watergate",
    title: "Watergate Records",
    blurb:
      "Records from the Watergate investigations — court proceedings, congressional inquiries, and archival releases.",
    provenance:
      "Released by the National Archives, the federal courts, and Congress. Investigation records span 1972–1975.",
    overview: [
      "The Watergate investigations produced an extensive documentary record: grand-jury materials, White House tape recordings and transcripts, and congressional investigation files.",
      "This collection gathers released Watergate-era records, each linked to its archival source.",
    ],
    documentIds: [],
  },
  {
    slug: "cold-war",
    title: "Cold War Records",
    blurb:
      "Declassified records of Cold War-era intelligence and foreign policy — agency histories, State Department volumes, and archival releases.",
    provenance:
      "Released by the CIA, the State Department's Office of the Historian (Foreign Relations of the United States), and the National Archives. Records span roughly 1945–1991.",
    overview: [
      "Decades of declassification have opened much of the Cold War record: intelligence assessments, covert action records, and the policy deliberations behind them.",
      "This collection draws together those released records — CIA histories, State Department volumes, and archival releases — each linked to its source.",
    ],
    documentIds: [],
  },
  {
    slug: "history",
    title: "Historical Releases",
    blurb:
      "Declassified historical collections — the Pentagon Papers, the CIA's 'Family Jewels,' the Church Committee report, FRUS: Iran 1951–1954, and the FBI's 2025 release of its files on Dr. Martin Luther King Jr.",
    provenance:
      "Released by the National Archives, the CIA FOIA reading room, the U.S. Senate, the State Department's Office of the Historian, and the FBI.",
    overview: [
      "This collection gathers declassified records that are frequently cited in the historical literature: the Defense Department's Vietnam study (the Pentagon Papers), the CIA's 1973 'Family Jewels' compilation, and the Church Committee's 1976 report on intelligence activities.",
      "It also includes the State Department's Foreign Relations of the United States volume documenting the 1953 coup in Iran, and the FBI surveillance files on Dr. Martin Luther King Jr. released through the National Archives in 2025.",
    ],
    documentIds: [
      "pentagon-papers",
      "cia-family-jewels",
      "church-committee-report",
      "frus-iran-1953",
      "cointelpro-mlk-2025",
    ],
  },
];

export const TIMELINES: Record<string, TimelineEvent[]> = {
  uap: [
    { date: "1995-07-28", title: "GAO reports on its search for records on the 1947 Roswell crash", documentId: "roswell-case-closed", page: 1 },
    { date: "2021-06-25", title: "ODNI delivers preliminary UAP assessment to Congress", documentId: "uap-odni-prelim-2021", page: 1 },
    { date: "2023-01-12", title: "2022 annual UAP report catalogues 510 reports", documentId: "uap-odni-annual-2022", page: 1 },
    { date: "2024-03-08", title: "AARO releases Historical Record Report, Volume 1", documentId: "aaro-historical-record-v1", page: 1 },
    { date: "2025-04-24", title: "National Archives releases first records in the UAP Records Collection (RG 615)", documentId: "uap-nara-rg615", page: 1 },
    { date: "2026-05-08", title: "Department of War launches PURSUE at war.gov/UFO with 162 declassified files", documentId: "uap-pursue-program", page: 1 },
    { date: "2026-05-22", title: "PURSUE second release published on war.gov/UFO", documentId: "uap-pursue-program", page: 1 },
    { date: "2026-06-12", title: "PURSUE third release: 72 files from the CIA, FBI, NASA, and the Pentagon", documentId: "uap-pursue-program", page: 1 },
    { date: "2026-07-10", title: "PURSUE fourth release: 40 files, including a DOE report on a 2015 incursion over the Pantex nuclear facility", documentId: "uap-pursue-program", page: 1 },
  ],
  jfk: [
    { date: "2025-03-18", title: "2025 release opens previously withheld JFK files in full", documentId: "jfk-2025-release", page: 1 },
  ],
  epstein: [
    { date: "2024-01-03", title: "SDNY begins unsealing Giuffre v. Maxwell records", documentId: "epstein-giuffre-maxwell-unsealed", page: 1 },
    { date: "2025-02-27", title: "DOJ releases 'Phase 1' Epstein records", documentId: "epstein-doj-phase-1", page: 1 },
  ],
  mkultra: [
    { date: "1953-04-13", title: "MKUltra established by CIA directive", documentId: "mkultra-subprojects-foia", page: 1 },
    { date: "1973-05-16", title: "'Family Jewels' compilation assembled internally", documentId: "cia-family-jewels", page: 1 },
    { date: "1976-04-26", title: "Church Committee reports on intelligence abuses", documentId: "church-committee-report", page: 1 },
    { date: "1977-08-03", title: "Senate holds joint hearing on MKUltra", documentId: "mkultra-senate-1977", page: 1 },
    { date: "2018-01-18", title: "Surviving subproject files posted to CIA reading room", documentId: "mkultra-subprojects-foia", page: 1 },
  ],
  "sept-11": [
    { date: "2004-07-22", title: "9/11 Commission publishes its final report", documentId: "sept11-commission-report", page: 1 },
  ],
};

export const ENTITIES: Entity[] = [
  { name: "Jeffrey Epstein", type: "person" },
  { name: "Ghislaine Maxwell", type: "person" },
  { name: "Virginia Giuffre", type: "person" },
  { name: "Lee Harvey Oswald", type: "person" },
  { name: "Sidney Gottlieb", type: "person" },
  { name: "Mohammad Mosaddegh", type: "person" },
  { name: "Kermit Roosevelt", type: "person" },
  { name: "Richard Helms", type: "person" },
  { name: "Martin Luther King Jr.", type: "person" },
  { name: "J. Edgar Hoover", type: "person" },
  { name: "Central Intelligence Agency", type: "org" },
  { name: "Federal Bureau of Investigation", type: "org" },
  { name: "Office of the Director of National Intelligence", type: "org" },
  { name: "All-domain Anomaly Resolution Office", type: "org" },
  { name: "United States Air Force", type: "org" },
  { name: "U.S. Department of Defense", type: "org" },
  { name: "Mexico City", type: "place" },
  { name: "Tehran", type: "place" },
  { name: "Roswell, New Mexico", type: "place" },
  { name: "MKUltra", type: "program" },
  { name: "Operation Ajax (TPAJAX)", type: "program" },
  { name: "COINTELPRO", type: "program" },
  { name: "Operation Mockingbird", type: "program" },
];
