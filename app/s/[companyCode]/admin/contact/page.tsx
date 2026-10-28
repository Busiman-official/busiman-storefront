import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchStorefrontAdminDraft } from "@/lib/api";
import { requireAdminAuth } from "@/lib/adminAuth";
import { AdminLoginGate } from "@/components/admin/AdminLoginGate";
import { AdminContactView } from "./AdminContactView";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminContactPage({ params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const auth = await requireAdminAuth(companyCode);
  if (!auth) notFound();
  if (!auth.authenticated) return <AdminLoginGate companyCode={companyCode} siteDetails={auth.site.siteDetails} />;

  const { site, token } = auth;
  const draft = await fetchStorefrontAdminDraft(companyCode, token);

  return (
    <AdminContactView
      companyCode={companyCode}
      initialHasDraft={draft?.hasDraft ?? false}
      initialSiteDetails={draft?.siteDetails ?? site.siteDetails}
      site={site}
    />
  );
}
