// Notable entities + aliases, mirrored from scripts/enrich.mjs (keep in sync).
// enrich.mjs bakes entity membership onto each document from its full text; this
// map lets the UI detect which entities a search query names, so it can show the
// connection between them.

export const ENTITY_ALIASES: Record<string, string[]> = {
  "Jeffrey Epstein": ["jeffrey epstein", "epstein"],
  "Ghislaine Maxwell": ["ghislaine maxwell", "maxwell"],
  "Virginia Giuffre": ["virginia giuffre", "giuffre"],
  "Prince Andrew": ["prince andrew"],
  "Donald Trump": ["donald trump", "donald j. trump", "president trump", "trump"],
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
  MKUltra: ["mkultra", "mk-ultra", "mk ultra"],
  COINTELPRO: ["cointelpro"],
  "Operation Mockingbird": ["operation mockingbird"],
  "Bay of Pigs": ["bay of pigs"],
  Watergate: ["watergate"],
  "September 11 attacks": ["september 11", "9/11", "9-11 attacks"],
  "Warren Commission": ["warren commission"],
  "Church Committee": ["church committee"],
  Roswell: ["roswell"],
  "Mexico City": ["mexico city"],
  Guantanamo: ["guantanamo", "guantánamo"],
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Canonical entities named anywhere in the query, in dictionary order, deduped. */
export function findEntitiesInQuery(query: string): string[] {
  const found: string[] = [];
  for (const [canonical, aliases] of Object.entries(ENTITY_ALIASES)) {
    const re = new RegExp(`\\b(?:${aliases.map(escapeRegExp).join("|")})\\b`, "i");
    if (re.test(query)) found.push(canonical);
  }
  return found;
}
