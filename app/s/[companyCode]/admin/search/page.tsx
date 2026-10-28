import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCategories, fetchSearch, fetchStorefrontAdminDraft, type CatalogSort } from "@/lib/api";
import { requireAdminAuth } from "@/lib/adminAuth";
import { AdminLoginGate } from "@/components/admin/AdminLoginGate";
import { AdminSearchView } from "./AdminSearchView";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

const VALID_SORTS: CatalogSort[] = ["name", "price_asc", "price_desc"];

export default async function AdminSearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyCode: string }>;
  searchParams: Promise<{ q?: string; page?: string; category?: string; sort?: string; inStockOnly?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const { companyCode } = await params;
  const auth = await requireAdminAuth(companyCode);
  if (!auth) notFound();
  if (!auth.authenticated) return <AdminLoginGate companyCode={companyCode} siteDetails={auth.site.siteDetails} />;

  const { q = "", page: pageParam, category, sort: sortParam, inStockOnly: inStockParam, minPrice: minPriceParam, maxPrice: maxPriceParam } =
    await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const sort: CatalogSort | undefined = sortParam && VALID_SORTS.includes(sortParam as CatalogSort) ? (sortParam as CatalogSort) : undefined;
  const inStockOnly = inStockParam === "true";
  const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;

  const { site, token } = auth;
  const [draft, results, categories] = await Promise.all([
    fetchStorefrontAdminDraft(companyCode, token),
    fetchSearch(companyCode, q, page, { category, sort, inStockOnly, minPrice, maxPrice }),
    fetchCategories(companyCode),
  ]);

  return (
    <AdminSearchView
      category={category}
      categories={categories}
      companyCode={companyCode}
      inStockOnly={inStockOnly}
      initialHasDraft={draft?.hasDraft ?? false}
      initialSiteDetails={draft?.siteDetails ?? site.siteDetails}
      maxPrice={maxPrice}
      minPrice={minPrice}
      page={page}
      q={q}
      results={results}
      site={site}
      sort={sort}
    />
  );
}
