/**
 * Shared loading boundary for every route under /s/[companyCode]/** (catalog, PDP, cart, checkout,
 * search, policies) — Next.js renders this automatically while the route's own async Server
 * Component is fetching. Previously there was none anywhere under this segment, so a slow fetch
 * just showed a blank page (see reports/Busiman ecommerce department audit.md's IMPROVEMENTS list).
 * Deliberately generic (no site colors/logo) — the site config itself is one of the things that
 * might still be loading.
 */
export default function StorefrontLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 animate-pulse px-4 py-8" aria-busy="true" aria-live="polite">
      <div className="mb-6 h-3 w-40 rounded bg-sf-line" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="space-y-2" key={i}>
            <div className="aspect-square rounded-lg bg-sf-line" />
            <div className="h-3 w-3/4 rounded bg-sf-line" />
            <div className="h-3 w-1/2 rounded bg-sf-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
