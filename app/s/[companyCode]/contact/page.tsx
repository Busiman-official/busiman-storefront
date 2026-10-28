import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSiteConfig } from "@/lib/api";
import { ContactPageBody } from "./ContactPageBody";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ companyCode: string }>;
}): Promise<Metadata> {
  const { companyCode } = await params;
  const site = await fetchSiteConfig(companyCode);
  if (!site) return {};
  return { title: `Contact — ${site.siteDetails.storeName}` };
}

export default async function ContactPage({ params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const site = await fetchSiteConfig(companyCode);
  if (!site) notFound();

  return <ContactPageBody companyCode={companyCode} site={site} />;
}
