"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { NavbarFromSite, StoreFooter } from "@/components/templates/shared";
import { CartBody } from "../../cart/CartBody";
import type { StorefrontSite, StorefrontSiteDetails } from "@/lib/api";

export function AdminCartView({
  companyCode,
  site,
  initialSiteDetails,
  initialHasDraft,
}: {
  companyCode: string;
  site: StorefrontSite;
  initialSiteDetails: StorefrontSiteDetails;
  initialHasDraft: boolean;
}) {
  return (
    <AdminShell companyCode={companyCode} initialHasDraft={initialHasDraft} initialSiteDetails={initialSiteDetails}>
      {(siteDetails) => {
        const liveSite = { ...site, siteDetails };
        return (
          <>
            <NavbarFromSite companyCode={companyCode} site={liveSite} />
            <CartBody accent={siteDetails.accentColor || "#2563EB"} companyCode={companyCode} currency={siteDetails.currency} />
            <StoreFooter companyCode={companyCode} site={liveSite} />
          </>
        );
      }}
    </AdminShell>
  );
}
