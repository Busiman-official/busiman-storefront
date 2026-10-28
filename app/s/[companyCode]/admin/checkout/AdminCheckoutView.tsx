"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { NavbarFromSite } from "@/components/templates/shared";
import { CheckoutBody } from "../../checkout/CheckoutBody";
import type { StorefrontSite, StorefrontSiteDetails } from "@/lib/api";

export function AdminCheckoutView({
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
      {(siteDetails) => (
        <>
          <NavbarFromSite companyCode={companyCode} site={{ ...site, siteDetails }} />
          <CheckoutBody
            accent={siteDetails.accentColor || "#2563EB"}
            codEnabled={Boolean(siteDetails.codEnabled)}
            codExtraFee={siteDetails.codExtraFee ?? 0}
            codMaxOrderValue={siteDetails.codMaxOrderValue}
            companyCode={companyCode}
            currency={siteDetails.currency}
            requiresPincode={siteDetails.deliveryMode === "banded"}
          />
        </>
      )}
    </AdminShell>
  );
}
