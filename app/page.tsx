/**
 * Apex-domain fallback — reached only when middleware found no companyCode to rewrite to (the bare
 * `busiman.org`/`www` host on this deployment, or any unrecognized hostname). Real storefronts
 * never render this; it exists only so the deployment itself has a sane response at `/`.
 */
export default function ApexFallbackPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-2">
        <h1 className="text-xl font-semibold text-sf-ink">Busiman Storefronts</h1>
        <p className="text-sm text-sf-ink-soft">
          This domain hosts online stores built with Busiman. Visit a store at its own address,
          e.g. yourstore.busiman.org.
        </p>
      </div>
    </main>
  );
}
