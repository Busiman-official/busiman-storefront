"use client";

import { useRouter } from "next/navigation";
import type { CatalogSort } from "@/lib/api";

const SORT_LABELS: Record<CatalogSort, string> = {
  name: "Name",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
};

export function CatalogFilterBar({
  basePath,
  categories,
  activeCategory,
  activeSort,
}: {
  basePath: string;
  categories: string[];
  activeCategory?: string;
  activeSort: CatalogSort;
}) {
  const router = useRouter();

  function navigate(next: { category?: string; sort?: CatalogSort }) {
    const params = new URLSearchParams();
    const category = next.category !== undefined ? next.category : activeCategory;
    const sort = next.sort ?? activeSort;
    if (category) params.set("category", category);
    if (sort !== "name") params.set("sort", sort);
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        <button
          className="cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors"
          onClick={() => navigate({ category: undefined })}
          style={
            !activeCategory
              ? { borderColor: "var(--sf-ink)", backgroundColor: "var(--sf-ink)", color: "var(--sf-surface)" }
              : { borderColor: "var(--sf-line)", color: "var(--sf-ink-soft)" }
          }
          type="button"
        >
          All
        </button>
        {categories.map((c) => (
          <button
            className="cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors"
            key={c}
            onClick={() => navigate({ category: c })}
            style={
              activeCategory === c
                ? { borderColor: "var(--sf-ink)", backgroundColor: "var(--sf-ink)", color: "var(--sf-surface)" }
                : { borderColor: "var(--sf-line)", color: "var(--sf-ink-soft)" }
            }
            type="button"
          >
            {c}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-xs font-medium text-sf-ink-soft">
        Sort
        <div className="relative">
          <select
            className="cursor-pointer appearance-none rounded-full border border-sf-line bg-sf-surface py-1.5 pl-3 pr-8 text-xs font-medium text-sf-ink"
            onChange={(e) => navigate({ sort: e.target.value as CatalogSort })}
            value={activeSort}
          >
            {(Object.keys(SORT_LABELS) as CatalogSort[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-sf-ink-soft"
            fill="none"
            height="12"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="12"
          >
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </label>
    </div>
  );
}
