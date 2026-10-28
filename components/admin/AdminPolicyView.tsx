"use client";

import { AdminShell } from "./AdminShell";
import { EditableMarkdown } from "./EditableMarkdown";
import { PolicyPageBody } from "@/components/PolicyPageBody";
import type { DraftFieldKey } from "./EditModeContext";
import type { StorefrontSite, StorefrontSiteDetails, StorefrontPolicies } from "@/lib/api";

export type PolicyKey = "shipping" | "returns" | "terms" | "privacy";

/** Shared by all four admin policy mirror routes (shipping/returns/terms/privacy) — only the
 * title, key, and default (boilerplate fallback) text differ between them. The policy text itself
 * is click-to-edit here, same mechanism as storeName/aboutText elsewhere, bound to this field's own
 * "policy:{key}" DraftFieldKey (see EditModeContext.tsx) so it saves to the `policies` sub-document,
 * not siteDetails. */
export function AdminPolicyView({
  companyCode,
  site,
  initialSiteDetails,
  initialPolicies,
  initialHasDraft,
  policyKey,
  title,
  defaultText,
}: {
  companyCode: string;
  site: StorefrontSite;
  initialSiteDetails: StorefrontSiteDetails;
  initialPolicies: StorefrontPolicies;
  initialHasDraft: boolean;
  policyKey: PolicyKey;
  title: string;
  defaultText: string;
}) {
  const field = `policy:${policyKey}` as DraftFieldKey;

  return (
    <AdminShell
      companyCode={companyCode}
      initialHasDraft={initialHasDraft}
      initialPolicies={initialPolicies}
      initialSiteDetails={initialSiteDetails}
    >
      {(siteDetails, policies) => {
        // Shows exactly what's actually live right now — the merchant's own text if they've
        // written any, else the same auto-generated boilerplate a real shopper currently sees
        // (see policyDefaults, built from this store's real delivery/contact settings). Still
        // click-to-edit either way; editing starts from whichever of the two is showing, so
        // tweaking the boilerplate is as easy as writing from scratch.
        const effectiveText = policies[policyKey] || defaultText;
        return (
          <PolicyPageBody companyCode={companyCode} site={{ ...site, siteDetails }} title={title}>
            <EditableMarkdown companyCode={companyCode} field={field} value={effectiveText} />
          </PolicyPageBody>
        );
      }}
    </AdminShell>
  );
}
