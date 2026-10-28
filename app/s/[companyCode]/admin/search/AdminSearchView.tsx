"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { SearchPageBody } from "../../search/SearchPageBody";
import type { CatalogSort, StorefrontSearchResult, StorefrontSite, StorefrontSiteDetails } from "@/lib/api";

export function AdminSearchView({
  companyCode,
  site,
  initialSiteDetails,
  initialHasDraft,
  results,
  categories,
  q,
  page,
  category,
  sort,
  inStockOnly,
  minPrice,
  maxPrice,
}: {
  companyCode: string;
  site: StorefrontSite;
  initialSiteDetails: StorefrontSiteDetails;
  initialHasDraft: boolean;
  results: StorefrontSearchResult;
  categories: string[];
  q: string;
  page: number;
  category?: string;
  sort?: CatalogSort;
  inStockOnly: boolean;
  minPrice?: number;
  maxPrice?: number;
}) {
  return (
    <AdminShell companyCode={companyCode} initialHasDraft={initialHasDraft} initialSiteDetails={initialSiteDetails}>
      {(siteDetails) => (
        <SearchPageBody
          basePath={`/s/${companyCode}/admin/search`}
          category={category}
          categories={categories}
          companyCode={companyCode}
          homeHref={`/s/${companyCode}/admin`}
          inStockOnly={inStockOnly}
          maxPrice={maxPrice}
          minPrice={minPrice}
          page={page}
          q={q}
          results={results}
          site={{ ...site, siteDetails }}
          sort={sort}
        />
      )}
    </AdminShell>
  );
}
