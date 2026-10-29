"use client";

/**
 * Shared error boundary for every route under /s/[companyCode]/** — Next.js renders this when the
 * route's own Server Component throws (e.g. the API server is briefly unreachable). Previously
 * there was none anywhere under this segment: an outage made a live store render as a plain 404
 * via notFound(), not a retryable error (see reports/Busiman ecommerce department audit.md's
 * IMPROVEMENTS list). Must be a Client Component — Next.js requires it.
 */
export default function StorefrontError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <h1 className="font-heading text-lg font-semibold text-sf-ink">Something went wrong</h1>
      <p className="text-sm text-sf-ink-soft">This page couldn&apos;t load. Please try again.</p>
      <button
        className="rounded-md border border-sf-line px-4 py-2 text-sm font-medium text-sf-ink"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
