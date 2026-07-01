"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SearchBarProps {
  initialQuery?: string;
  /** "large" on the home page, "compact" in the header. */
  variant?: "large" | "compact";
  autoFocus?: boolean;
}

export function SearchBar({
  initialQuery = "",
  variant = "large",
  autoFocus = false,
}: SearchBarProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  }

  const compact = variant === "compact";

  return (
    // action/method let the search work even before JS hydrates. Raw <form>
    // actions don't get basePath applied, so prefix it explicitly (inlined at build).
    <form
      role="search"
      action={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/search/`}
      method="get"
      onSubmit={onSubmit}
      className="flex w-full gap-2"
    >
      <label htmlFor={`q-${variant}`} className="sr-only">
        Search declassified documents
      </label>
      <input
        id={`q-${variant}`}
        name="q"
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
        placeholder={
          compact ? "Search documents" : "Search by name, agency, topic, or keyword"
        }
        className={`flex-1 min-w-0 rounded border border-line bg-paper text-ink placeholder:text-faint focus:outline-none focus:border-accent ${
          compact ? "h-9 px-3 text-sm" : "h-12 px-4 text-base"
        }`}
      />
      <button
        type="submit"
        className={`shrink-0 rounded bg-ink text-paper font-medium hover:bg-ink-soft ${
          compact ? "h-9 px-3 text-sm" : "h-12 px-6 text-base"
        }`}
      >
        Search
      </button>
    </form>
  );
}
