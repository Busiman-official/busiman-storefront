import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSiteConfig } from "@/lib/api";
import { PolicyPageBody } from "@/components/PolicyPageBody";
import { MarkdownContent } from "@/components/MarkdownContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ companyCode: string }>;
}): Promise<Metadata> {
  const { companyCode } = await params;
  const site = await fetchSiteConfig(companyCode);
  if (!site) return {};
  return { title: `Shipping policy — ${site.siteDetails.storeName}` };
}

export default async function ShippingPolicyPage({ params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const site = await fetchSiteConfig(companyCode);
  if (!site) notFound();

  const text = site.policies?.shipping || site.policyDefaults?.shipping || "";

  return (
    <PolicyPageBody companyCode={companyCode} site={site} title="Shipping policy">
      <MarkdownContent text={text} />
    </PolicyPageBody>
  );
}
