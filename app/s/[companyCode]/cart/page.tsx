import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSiteConfig } from "@/lib/api";
import { NavbarFromSite, StoreFooter } from "@/components/templates/shared";
import { CartBody } from "./CartBody";

export const metadata: Metadata = {
  title: "Your cart",
  robots: { index: false, follow: false },
};

export default async function CartPage({ params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const site = await fetchSiteConfig(companyCode);
  if (!site) notFound();

  return (
    <>
      <NavbarFromSite companyCode={companyCode} site={site} />
      <CartBody accent={site.siteDetails.accentColor || "#2563EB"} companyCode={companyCode} currency={site.siteDetails.currency} />
      <StoreFooter companyCode={companyCode} site={site} />
    </>
  );
}
