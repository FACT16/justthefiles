import Link from "next/link";

// Channels the pipeline actually ingests from. Individual records additionally
// link out to other official publishers — the /sources page holds the registry.
const INGESTED_FROM = [
  "Federal Register",
  "govinfo (U.S. GPO)",
  "war.gov/UFO (PURSUE)",
  "Library of Congress (imagery)",
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="text-sm font-semibold text-ink">Just the Files</div>
            <p className="mt-2 max-w-xs text-sm text-muted">
              Search declassified and publicly released U.S. government documents in one
              place. Every result links to its original source.
            </p>
            <p className="mt-3 text-xs text-faint">
              Built and maintained by{" "}
              <a href="https://github.com/FACT16" target="_blank" rel="noopener noreferrer">
                Anderson Davis
              </a>
              .
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-faint">
              Browse
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              <li><Link href="/search">Search</Link></li>
              <li><Link href="/topics">Topics</Link></li>
              <li><Link href="/sources">Sources &amp; monitoring</Link></li>
              <li><Link href="/about">About &amp; method</Link></li>
              <li>
                <a
                  href="https://github.com/FACT16/justthefiles"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Source on GitHub
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-faint">
              <Link href="/sources" className="text-faint hover:text-ink">Sources</Link>
            </div>
            <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
              {INGESTED_FROM.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-faint">
              Ingested automatically. Individual records also link to the National
              Archives, ODNI, the FBI&rsquo;s FOIA reading room, the CIA reading room,
              and federal courts — see <Link href="/sources">the full registry</Link>.
            </p>
          </div>
        </div>

        <p className="mt-8 border-t border-line-soft pt-4 text-xs leading-relaxed text-faint">
          All documents referenced here are public records published by U.S. government
          agencies and courts. Just the Files is an independent research tool and is not
          affiliated with, or endorsed by, any government agency.
        </p>
      </div>
    </footer>
  );
}
