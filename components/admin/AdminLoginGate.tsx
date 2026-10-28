import { LogoBadge } from "@/components/templates/shared";
import { AdminLoginForm } from "@/app/s/[companyCode]/admin/AdminLoginForm";
import type { StorefrontSiteDetails } from "@/lib/api";

/** Same PIN-login screen admin/page.tsx shows — reused by every other admin-mirrored page so an
 * unauthenticated (or logged-out, or session-expired) visitor sees the identical gate no matter
 * which URL under /admin they landed on, instead of only the home page being gated properly. */
export function AdminLoginGate({ companyCode, siteDetails }: { companyCode: string; siteDetails: StorefrontSiteDetails }) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-sf-bg px-4 py-12">
      <div className="flex w-full max-w-xs flex-col items-center gap-6">
        <LogoBadge accent={siteDetails.accentColor} logoUrl={siteDetails.logoUrl} size={48} storeName={siteDetails.storeName} />
        <AdminLoginForm companyCode={companyCode} />
      </div>
    </main>
  );
}
