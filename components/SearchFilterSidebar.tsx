"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CatalogSort } from "@/lib/api";

const SORT_LABELS: Record<CatalogSort, string> = {
  name: "Name A-Z",
  price_asc: "Price: low to high",
  price_desc: "Price: high to low",
};

function XIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16">
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Search results filter sidebar — URL-driven like CatalogFilterBar (every filter state is a real,
 * shareable link, never client-only state). Renders as a persistent left column at md+ and
 * collapses into a "Filters" button + bottom sheet below that, reusing CartBadge's own
 * toggle+backdrop overlay pattern rather than inventing a new one.
 */
export function SearchFilterSidebar({
  basePath,
  query,
  categories,
  priceBounds,
  activeCategory,
  activeSort,
  inStockOnly,
  minPrice,
  maxPrice,
}: {
  basePath: string;
  query: string;
  categories: string[];
  priceBounds: { min: number | null; max: number | null };
  activeCategory?: string;
  activeSort?: CatalogSort;
  inStockOnly: boolean;
  minPrice?: number;
  maxPrice?: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [minInput, setMinInput] = useState(minPrice != null ? String(minPrice) : "");
  const [maxInput, setMaxInput] = useState(maxPrice != null ? String(maxPrice) : "");

  const activeFilterCount = [activeCategory, activeSort, inStockOnly || undefined, minPrice, maxPrice].filter(
    (v) => v != null,
  ).length;

  function navigate(next: {
    category?: string | null;
    sort?: CatalogSort | null;
    inStockOnly?: boolean;
    minPrice?: number | null;
    maxPrice?: number | null;
  }) {
    const category = next.category !== undefined ? next.category : activeCategory;
    const sort = next.sort !== undefined ? next.sort : activeSort;
    const nextInStock = next.inStockOnly !== undefined ? next.inStockOnly : inStockOnly;
    const nextMin = next.minPrice !== undefined ? next.minPrice : minPrice;
    const nextMax = next.maxPrice !== undefined ? next.maxPrice : maxPrice;

    const params = new URLSearchParams({ q: query });
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);
    if (nextInStock) params.set("inStockOnly", "true");
    if (nextMin != null) params.set("minPrice", String(nextMin));
    if (nextMax != null) params.set("maxPrice", String(nextMax));

    router.push(`${basePath}?${params.toString()}`);
    setOpen(false);
  }

  const hasPriceRange = priceBounds.min != null && priceBounds.max != null && priceBounds.min < priceBounds.max;

  const controls = (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-sf-ink-soft">Sort</p>
        <select
          className="w-full cursor-pointer rounded-md border border-sf-line bg-sf-surface px-3 py-2 text-sm text-sf-ink"
          onChange={(e) => navigate({ sort: (e.target.value || null) as CatalogSort | null })}
          value={activeSort ?? ""}
        >
          <option value="">Relevance</option>
          {(Object.keys(SORT_LABELS) as CatalogSort[]).map((key) => (
            <option key={key} value={key}>
              {SORT_LABELS[key]}
            </option>
          ))}
        </select>
      </div>

      {categories.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-sf-ink-soft">Category</p>
          <div className="space-y-1.5">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-sf-ink">
              <input checked={!activeCategory} className="accent-sf-ink" name="category" onChange={() => navigate({ category: null })} type="radio" />
              All
            </label>
            {categories.map((c) => (
              <label className="flex cursor-pointer items-center gap-2 text-sm text-sf-ink" key={c}>
                <input checked={activeCategory === c} className="accent-sf-ink" name="category" onChange={() => navigate({ category: c })} type="radio" />
                {c}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      {hasPriceRange ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-sf-ink-soft">Price</p>
          <div className="flex items-center gap-2">
            <input
              className="w-full min-w-0 rounded-md border border-sf-line px-2 py-1.5 text-sm text-sf-ink"
              inputMode="numeric"
              onChange={(e) => setMinInput(e.target.value.replace(/\D/g, ""))}
              placeholder={String(priceBounds.min)}
              value={minInput}
            />
            <span className="text-sf-ink-soft">–</span>
            <input
              className="w-full min-w-0 rounded-md border border-sf-line px-2 py-1.5 text-sm text-sf-ink"
              inputMode="numeric"
              onChange={(e) => setMaxInput(e.target.value.replace(/\D/g, ""))}
              placeholder={String(priceBounds.max)}
              value={maxInput}
            />
          </div>
          <button
            className="w-full cursor-pointer rounded-md border border-sf-line py-1.5 text-xs font-semibold text-sf-ink transition-colors hover:border-sf-ink-soft"
            onClick={() => navigate({ minPrice: minInput ? Number(minInput) : null, maxPrice: maxInput ? Number(maxInput) : null })}
            type="button"
          >
            Apply price
          </button>
        </div>
      ) : null}

      <label className="flex cursor-pointer items-center gap-2 text-sm text-sf-ink">
        <input checked={inStockOnly} className="accent-sf-ink" onChange={(e) => navigate({ inStockOnly: e.target.checked })} type="checkbox" />
        In stock only
      </label>

      {activeFilterCount > 0 ? (
        <button
          className="w-full cursor-pointer text-center text-xs font-medium text-sf-ink-soft underline-offset-2 hover:underline"
          onClick={() => navigate({ category: null, sort: null, inStockOnly: false, minPrice: null, maxPrice: null })}
          type="button"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );

  return (
    <>
      <aside className="hidden w-56 shrink-0 md:block">{controls}</aside>

      <div className="md:hidden">
        <button
          className="flex cursor-pointer items-center gap-2 rounded-full border border-sf-line px-4 py-2 text-sm font-medium text-sf-ink"
          onClick={() => setOpen(true)}
          type="button"
        >
          <FilterIcon />
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>

        {open ? (
          <>
            <button aria-label="Close filters" className="fixed inset-0 z-40 cursor-default bg-black/30" onClick={() => setOpen(false)} type="button" />
            <div className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-sf-line bg-sf-surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-heading text-base font-semibold text-sf-ink">Filters</p>
                <button aria-label="Close filters" className="cursor-pointer text-sf-ink-soft" onClick={() => setOpen(false)} type="button">
                  <XIcon />
                </button>
              </div>
              {controls}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
