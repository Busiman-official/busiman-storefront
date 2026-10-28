import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSiteConfig } from "@/lib/api";
import { NavbarFromSite } from "@/components/templates/shared";
import { CheckoutBody } from "./CheckoutBody";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({ params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const site = await fetchSiteConfig(companyCode);
  if (!site) notFound();

  return (
    <>
      <NavbarFromSite companyCode={companyCode} site={site} />
      <CheckoutBody
        accent={site.siteDetails.accentColor || "#2563EB"}
        codEnabled={Boolean(site.siteDetails.codEnabled)}
        codExtraFee={site.siteDetails.codExtraFee ?? 0}
        codMaxOrderValue={site.siteDetails.codMaxOrderValue}
        companyCode={companyCode}
        currency={site.siteDetails.currency}
        requiresPincode={site.siteDetails.deliveryMode === "banded"}
      />
    </>
  );
}
