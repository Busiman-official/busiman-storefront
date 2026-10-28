import { NavbarFromSite, StoreFooter, WhatsAppFloatButton } from "@/components/templates/shared";
import { EditableMarkdown } from "@/components/admin/EditableMarkdown";
import type { StorefrontSite } from "@/lib/api";

export function AboutPageBody({ companyCode, site }: { companyCode: string; site: StorefrontSite }) {
  const { siteDetails } = site;

  return (
    <>
      <NavbarFromSite companyCode={companyCode} site={site} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 space-y-4" id="section-page-content">
        <h1 className="font-heading text-xl font-semibold text-sf-ink">About {siteDetails.storeName}</h1>
        <EditableMarkdown
          className="text-sm"
          companyCode={companyCode}
          field="aboutText"
          inactiveFallback={<p className="text-sm text-sf-ink-soft">{siteDetails.storeName} hasn&apos;t added a store description yet.</p>}
          placeholder="Tell shoppers what makes your store worth buying from"
          value={siteDetails.aboutText ?? ""}
        />
      </main>

      <StoreFooter companyCode={companyCode} site={site} />
      <WhatsAppFloatButton storeName={siteDetails.storeName} whatsappNumber={siteDetails.whatsappNumber} />
    </>
  );
}
