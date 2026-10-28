import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchStorefrontAdminDraft } from "@/lib/api";
import { requireAdminAuth } from "@/lib/adminAuth";
import { AdminLoginGate } from "@/components/admin/AdminLoginGate";
import { AdminPolicyView } from "@/components/admin/AdminPolicyView";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPrivacyPolicyPage({ params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const auth = await requireAdminAuth(companyCode);
  if (!auth) notFound();
  if (!auth.authenticated) return <AdminLoginGate companyCode={companyCode} siteDetails={auth.site.siteDetails} />;

  const { site, token } = auth;
  const draft = await fetchStorefrontAdminDraft(companyCode, token);

  return (
    <AdminPolicyView
      companyCode={companyCode}
      defaultText={draft?.policyDefaults?.privacy ?? site.policyDefaults?.privacy ?? ""}
      initialHasDraft={draft?.hasDraft ?? false}
      initialPolicies={draft?.policies ?? site.policies ?? {}}
      initialSiteDetails={draft?.siteDetails ?? site.siteDetails}
      policyKey="privacy"
      site={site}
      title="Privacy policy"
    />
  );
}
