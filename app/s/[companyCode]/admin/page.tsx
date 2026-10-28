import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchCatalog, fetchCategories, fetchStorefrontAdminDraft, type CatalogSort } from "@/lib/api";
import { requireAdminAuth } from "@/lib/adminAuth";
import { AdminLoginGate } from "@/components/admin/AdminLoginGate";
import { AdminDashboard } from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Admin",
  // Never indexed, and never followed from — this is a login gate, not storefront content.
  robots: { index: false, follow: false },
};

const VALID_SORTS: CatalogSort[] = ["name", "price_asc", "price_desc"];

export default async function StorefrontAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyCode: string }>;
  searchParams: Promise<{ page?: string; category?: string; sort?: string }>;
}) {
  const { companyCode } = await params;
  const auth = await requireAdminAuth(companyCode);
  if (!auth) notFound();
  if (!auth.authenticated) return <AdminLoginGate companyCode={companyCode} siteDetails={auth.site.siteDetails} />;

  const { page: pageParam, category, sort: sortParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const sort: CatalogSort = VALID_SORTS.includes(sortParam as CatalogSort) ? (sortParam as CatalogSort) : "name";

  const { site, token } = auth;
  const draft = await fetchStorefrontAdminDraft(companyCode, token);
  const [catalog, categories] = await Promise.all([
    fetchCatalog(companyCode, page, { category, sort }),
    fetchCategories(companyCode),
  ]);

  return (
    <AdminDashboard
      activeCategory={category}
      activeSort={sort}
      catalog={catalog}
      categories={categories}
      companyCode={companyCode}
      initialHasDraft={draft?.hasDraft ?? false}
      site={{ ...site, siteDetails: draft?.siteDetails ?? site.siteDetails, templateId: draft?.templateId ?? site.templateId }}
      templateId={draft?.templateId ?? site.templateId}
    />
  );
}
