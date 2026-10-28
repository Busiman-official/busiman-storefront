"use client";

/**
 * Thin client wrapper around AdminShell — needed because a Server Component page can't pass a
 * render-prop function straight into a Client Component ("Functions are not valid as a child of
 * Client Components"). The page itself stays a Server Component and only passes plain, serializable
 * data (site/product objects) across that boundary; the render-prop closure is built here, entirely
 * on the client side, same pattern as the home page's AdminDashboard.
 */
import { AdminShell } from "@/components/admin/AdminShell";
import { ProductPageBody } from "../../../products/[slug]/ProductPageBody";
import type { StorefrontProductDetail, StorefrontSite, StorefrontSiteDetails } from "@/lib/api";

export function AdminProductView({
  companyCode,
  site,
  product,
  initialSiteDetails,
  initialHasDraft,
}: {
  companyCode: string;
  site: StorefrontSite;
  product: StorefrontProductDetail;
  initialSiteDetails: StorefrontSiteDetails;
  initialHasDraft: boolean;
}) {
  return (
    <AdminShell companyCode={companyCode} initialHasDraft={initialHasDraft} initialSiteDetails={initialSiteDetails}>
      {(siteDetails) => (
        <ProductPageBody companyCode={companyCode} homeHref={`/s/${companyCode}/admin`} product={product} site={{ ...site, siteDetails }} />
      )}
    </AdminShell>
  );
}
