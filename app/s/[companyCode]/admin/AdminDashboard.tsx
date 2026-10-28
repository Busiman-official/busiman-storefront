"use client";

/**
 * The home page's admin editor: renders the exact same template components the public storefront
 * uses (true WYSIWYG) through the shared AdminShell. Section visibility/design/logo are all managed
 * through the left SectionSidebar now (see sectionManifest.ts) — this used to carry trust-strip/
 * category-rail checkboxes in the toolbar directly; that moved into the sidebar's own per-section
 * toggle/detail view instead of living in two places.
 */
import type { CatalogSort, StorefrontCatalogPage, StorefrontSite, StorefrontTemplateId } from "@/lib/api";
import { ClassicTemplate } from "@/components/templates/ClassicTemplate";
import { ModernTemplate } from "@/components/templates/ModernTemplate";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { AdminShell } from "@/components/admin/AdminShell";
import { sectionsForHome } from "@/components/admin/sectionManifest";

export function AdminDashboard({
  companyCode,
  site,
  templateId,
  catalog,
  categories,
  activeCategory,
  activeSort,
  initialHasDraft,
}: {
  companyCode: string;
  site: StorefrontSite;
  templateId: StorefrontTemplateId;
  catalog: StorefrontCatalogPage;
  categories: string[];
  activeCategory?: string;
  activeSort: CatalogSort;
  initialHasDraft: boolean;
}) {
  let TemplateComponent = ClassicTemplate;
  if (templateId === "modern") TemplateComponent = ModernTemplate;
  else if (templateId === "minimal") TemplateComponent = MinimalTemplate;

  return (
    <AdminShell
      companyCode={companyCode}
      initialHasDraft={initialHasDraft}
      initialSiteDetails={site.siteDetails}
      sections={sectionsForHome(templateId)}
    >
      {(siteDetails) => (
        <TemplateComponent
          activeCategory={activeCategory}
          activeSort={activeSort}
          catalog={catalog}
          categories={categories}
          companyCode={companyCode}
          site={{ ...site, siteDetails, templateId }}
        />
      )}
    </AdminShell>
  );
}
