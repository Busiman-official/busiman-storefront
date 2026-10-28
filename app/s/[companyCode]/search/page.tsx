import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCategories, fetchSearch, fetchSiteConfig, type CatalogSort } from "@/lib/api";
import { SearchPageBody } from "./SearchPageBody";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: false },
};

const VALID_SORTS: CatalogSort[] = ["name", "price_asc", "price_desc"];

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyCode: string }>;
  searchParams: Promise<{ q?: string; page?: string; category?: string; sort?: string; inStockOnly?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const { companyCode } = await params;
  const { q = "", page: pageParam, category, sort: sortParam, inStockOnly: inStockParam, minPrice: minPriceParam, maxPrice: maxPriceParam } =
    await searchParams;
  const site = await fetchSiteConfig(companyCode);
  if (!site) notFound();

  const page = Math.max(1, Number(pageParam) || 1);
  const sort: CatalogSort | undefined = sortParam && VALID_SORTS.includes(sortParam as CatalogSort) ? (sortParam as CatalogSort) : undefined;
  const inStockOnly = inStockParam === "true";
  const minPrice = minPriceParam ? Number(minPriceParam) : undefined;
  const maxPrice = maxPriceParam ? Number(maxPriceParam) : undefined;

  // This page always shows products — a query filters them, filters alone (e.g. a category tile,
  // or clearing a filter back to "All") browse everything, same as the home page's default view.
  const [results, categories] = await Promise.all([
    fetchSearch(companyCode, q, page, { category, sort, inStockOnly, minPrice, maxPrice }),
    fetchCategories(companyCode),
  ]);

  return (
    <SearchPageBody
      basePath={`/s/${companyCode}/search`}
      category={category}
      categories={categories}
      companyCode={companyCode}
      homeHref={`/s/${companyCode}`}
      inStockOnly={inStockOnly}
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
