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
  return { title: `Privacy policy — ${site.siteDetails.storeName}` };
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const site = await fetchSiteConfig(companyCode);
  if (!site) notFound();

  const text = site.policies?.privacy || site.policyDefaults?.privacy || "";

  return (
    <PolicyPageBody companyCode={companyCode} site={site} title="Privacy policy">
      <MarkdownContent text={text} />
    </PolicyPageBody>
  );
}
