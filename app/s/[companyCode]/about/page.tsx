import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSiteConfig } from "@/lib/api";
import { AboutPageBody } from "./AboutPageBody";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ companyCode: string }>;
}): Promise<Metadata> {
  const { companyCode } = await params;
  const site = await fetchSiteConfig(companyCode);
  if (!site) return {};
  return { title: `About — ${site.siteDetails.storeName}` };
}

export default async function AboutPage({ params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const site = await fetchSiteConfig(companyCode);
  if (!site) notFound();

  return <AboutPageBody companyCode={companyCode} site={site} />;
}
