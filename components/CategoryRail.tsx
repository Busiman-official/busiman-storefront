import Link from "next/link";

function PlaceholderImageIcon() {
  // A generic "image coming soon" glyph — deliberately not a per-category icon, since these circles
  // are explicitly a placeholder for real category photos the merchant will add later.
  return (
    <svg aria-hidden="true" fill="none" height="22" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" width="22">
      <rect height="16" rx="2" width="18" x="3" y="4" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m21 15-5-5-9 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Horizontal-scrolling category rail — a quick-browse shortcut above the main product grid. Each
 * circle links to the search results page pre-filtered to that category, reusing its filter
 * sidebar (sort/price/in-stock) rather than the home page's plain category filter. Circles are
 * plain placeholder glyphs for now; the merchant will be able to set a real photo per category
 * later. */
export function CategoryRail({ companyCode, categories }: { companyCode: string; categories: string[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1">
      <div className="flex w-max gap-4 sm:gap-5">
        {categories.map((category) => (
          <Link
            className="group flex w-16 shrink-0 cursor-pointer flex-col items-center gap-1.5 sm:w-20"
            href={`/s/${companyCode}/search?category=${encodeURIComponent(category)}`}
            key={category}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-sf-line bg-sf-bg text-sf-ink-soft transition-colors group-hover:border-sf-ink-soft sm:h-20 sm:w-20">
              <PlaceholderImageIcon />
            </span>
            <span className="line-clamp-1 w-full text-center text-xs text-sf-ink">{category}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
