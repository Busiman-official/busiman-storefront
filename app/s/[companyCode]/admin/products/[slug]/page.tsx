import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProduct, fetchStorefrontAdminDraft } from "@/lib/api";
import { requireAdminAuth } from "@/lib/adminAuth";
import { AdminLoginGate } from "@/components/admin/AdminLoginGate";
import { AdminProductView } from "./AdminProductView";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminProductPage({
  params,
}: {
  params: Promise<{ companyCode: string; slug: string }>;
}) {
  const { companyCode, slug } = await params;
  const auth = await requireAdminAuth(companyCode);
  if (!auth) notFound();
  if (!auth.authenticated) return <AdminLoginGate companyCode={companyCode} siteDetails={auth.site.siteDetails} />;

  const { site, token } = auth;
  const [draft, product] = await Promise.all([fetchStorefrontAdminDraft(companyCode, token), fetchProduct(companyCode, slug)]);
  if (!product) notFound();

  return (
    <AdminProductView
      companyCode={companyCode}
      initialHasDraft={draft?.hasDraft ?? false}
      initialSiteDetails={draft?.siteDetails ?? site.siteDetails}
      product={product}
      site={site}
    />
  );
}
