"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

function FilterIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SearchBar({ companyCode, initialQuery = "" }: { companyCode: string; initialQuery?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(initialQuery);

  // Stay inside the admin editor if that's where this search bar is being used — mirrors
  // AdminNavGuard's own rewrite for plain links, needed here too since this navigates via
  // router.push rather than a clickable <a href>.
  function searchBasePath(): string {
    const adminPrefix = `/s/${companyCode}/admin`;
    return pathname?.startsWith(adminPrefix) ? adminPrefix : `/s/${companyCode}`;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`${searchBasePath()}/search?q=${encodeURIComponent(trimmed)}`);
  }

  function openFilters() {
    const trimmed = q.trim();
    router.push(`${searchBasePath()}/search${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`);
  }

  return (
    <form className="flex w-full items-center gap-2" onSubmit={handleSubmit}>
      <div className="relative min-w-0 flex-1">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sf-ink-soft"
          fill="none"
          height="16"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="16"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          aria-label="Search products"
          className="w-full rounded-full border border-sf-line bg-sf-bg py-2 pl-9 pr-3 text-sm text-sf-ink placeholder:text-sf-ink-soft focus:border-sf-ink-soft"
          name="q"
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products"
          type="search"
          value={q}
        />
      </div>
      <button
        aria-label="Filter products"
        className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-sf-line bg-sf-bg text-sf-ink-soft transition-colors hover:border-sf-ink-soft hover:text-sf-ink"
        onClick={openFilters}
        type="button"
      >
        <FilterIcon />
      </button>
    </form>
  );
}
