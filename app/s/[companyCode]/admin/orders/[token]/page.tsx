import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchOrderStatus, fetchStorefrontAdminDraft } from "@/lib/api";
import { requireAdminAuth } from "@/lib/adminAuth";
import { AdminLoginGate } from "@/components/admin/AdminLoginGate";
import { AdminOrderStatusView } from "./AdminOrderStatusView";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminOrderStatusPage({ params }: { params: Promise<{ companyCode: string; token: string }> }) {
  const { companyCode, token: orderToken } = await params;
  const auth = await requireAdminAuth(companyCode);
  if (!auth) notFound();
  if (!auth.authenticated) return <AdminLoginGate companyCode={companyCode} siteDetails={auth.site.siteDetails} />;

  const { site, token } = auth;
  const [draft, order] = await Promise.all([fetchStorefrontAdminDraft(companyCode, token), fetchOrderStatus(companyCode, orderToken)]);
  if (!order) notFound();

  return (
    <AdminOrderStatusView
      companyCode={companyCode}
      initialHasDraft={draft?.hasDraft ?? false}
      initialSiteDetails={draft?.siteDetails ?? site.siteDetails}
      order={order}
      site={site}
    />
  );
}
