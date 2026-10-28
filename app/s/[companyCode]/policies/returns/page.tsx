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
  return { title: `Returns & refunds — ${site.siteDetails.storeName}` };
}

export default async function ReturnsPolicyPage({ params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const site = await fetchSiteConfig(companyCode);
  if (!site) notFound();

  const text = site.policies?.returns || site.policyDefaults?.returns || "";

  return (
    <PolicyPageBody companyCode={companyCode} site={site} title="Returns & refunds">
      <MarkdownContent text={text} />
    </PolicyPageBody>
  );
}
