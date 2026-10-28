"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { OrderStatusBody } from "../../../orders/[token]/OrderStatusBody";
import type { OrderStatus, StorefrontSite, StorefrontSiteDetails } from "@/lib/api";

export function AdminOrderStatusView({
  companyCode,
  site,
  order,
  initialSiteDetails,
  initialHasDraft,
}: {
  companyCode: string;
  site: StorefrontSite;
  order: OrderStatus;
  initialSiteDetails: StorefrontSiteDetails;
  initialHasDraft: boolean;
}) {
  return (
    <AdminShell companyCode={companyCode} initialHasDraft={initialHasDraft} initialSiteDetails={initialSiteDetails}>
      {(siteDetails) => <OrderStatusBody companyCode={companyCode} order={order} site={{ ...site, siteDetails }} />}
    </AdminShell>
  );
}
