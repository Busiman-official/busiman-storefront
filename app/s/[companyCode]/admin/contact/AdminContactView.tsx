"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { ContactPageBody } from "../../contact/ContactPageBody";
import type { StorefrontSite, StorefrontSiteDetails } from "@/lib/api";

export function AdminContactView({
  companyCode,
  site,
  initialSiteDetails,
  initialHasDraft,
}: {
  companyCode: string;
  site: StorefrontSite;
  initialSiteDetails: StorefrontSiteDetails;
  initialHasDraft: boolean;
}) {
  return (
    <AdminShell companyCode={companyCode} initialHasDraft={initialHasDraft} initialSiteDetails={initialSiteDetails}>
      {(siteDetails) => <ContactPageBody companyCode={companyCode} site={{ ...site, siteDetails }} />}
    </AdminShell>
  );
}
