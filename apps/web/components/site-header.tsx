import Link from "next/link";
import { SearchBar } from "./search-bar";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center gap-4">
          <Link href="/" className="flex items-baseline gap-2 no-underline hover:no-underline">
            <span className="text-[1.05rem] font-semibold tracking-tight text-ink">
              Unredacted
            </span>
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-faint sm:inline">
              Declassified Archive
            </span>
          </Link>

          <div className="hidden flex-1 justify-center md:flex">
            <div className="w-full max-w-md">
              <SearchBar variant="compact" />
            </div>
          </div>

          <nav className="ml-auto flex items-center gap-4 text-sm text-muted">
            <Link href="/topics" className="text-muted hover:text-ink hover:no-underline">
              Topics
            </Link>
            <Link href="/about" className="text-muted hover:text-ink hover:no-underline">
              About
            </Link>
          </nav>
        </div>
      </div>

      {/* Honest, low-key notice: early corpus, excerpts pending full-text ingestion. */}
      <div className="border-t border-line-soft bg-canvas">
        <div className="mx-auto max-w-6xl px-4 py-1.5 text-xs text-muted">
          Early build · a growing corpus of real government records. Excerpts are
          catalog-level pending full-text ingestion — every document links to its original
          source.
        </div>
      </div>
    </header>
  );
}
