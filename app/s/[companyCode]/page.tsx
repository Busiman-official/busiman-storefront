import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCatalog, fetchCategories, fetchSiteConfig, type CatalogSort } from "@/lib/api";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";
import { ModernTemplate } from "@/components/templates/ModernTemplate";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";

const VALID_SORTS: CatalogSort[] = ["name", "price_asc", "price_desc"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ companyCode: string }>;
}): Promise<Metadata> {
  const { companyCode } = await params;
  const site = await fetchSiteConfig(companyCode);
  if (!site) return {};
  const title = site.siteDetails.storeName;
  const description = site.siteDetails.aboutText || `Shop online at ${site.siteDetails.storeName}.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: title,
      images: site.siteDetails.logoUrl ? [site.siteDetails.logoUrl] : undefined,
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: site.siteDetails.logoUrl ? [site.siteDetails.logoUrl] : undefined,
    },
  };
}

export default async function StorefrontPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyCode: string }>;
  searchParams: Promise<{ page?: string; category?: string; sort?: string }>;
}) {
  const { companyCode } = await params;
  const { page: pageParam, category, sort: sortParam } = await searchParams;
  const site = await fetchSiteConfig(companyCode);
  if (!site) notFound();

  const page = Math.max(1, Number(pageParam) || 1);
  const sort: CatalogSort = VALID_SORTS.includes(sortParam as CatalogSort) ? (sortParam as CatalogSort) : "name";
  const [catalog, categories] = await Promise.all([
    fetchCatalog(companyCode, page, { category, sort }),
    fetchCategories(companyCode),
  ]);

  const templateProps = { activeCategory: category, activeSort: sort, categories, catalog, companyCode, site };

  switch (site.templateId) {
    case "modern":
      return <ModernTemplate {...templateProps} />;
    case "minimal":
      return <MinimalTemplate {...templateProps} />;
    case "classic":
    default:
      return <ClassicTemplate {...templateProps} />;
  }
}
