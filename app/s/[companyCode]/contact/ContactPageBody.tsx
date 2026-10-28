import { NavbarFromSite, StoreFooter } from "@/components/templates/shared";
import type { StorefrontSite } from "@/lib/api";

export function ContactPageBody({ companyCode, site }: { companyCode: string; site: StorefrontSite }) {
  const { siteDetails } = site;
  const accent = siteDetails.accentColor || "#2563EB";
  const hasAnyContact = Boolean(siteDetails.contactPhone || siteDetails.whatsappNumber);

  return (
    <>
      <NavbarFromSite companyCode={companyCode} site={site} />

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 space-y-4" id="section-page-content">
        <h1 className="font-heading text-xl font-semibold text-sf-ink">Contact {siteDetails.storeName}</h1>

        {hasAnyContact ? (
          <div className="space-y-3 rounded-lg border border-sf-line bg-sf-surface p-4">
            {siteDetails.contactPhone ? (
              <div>
                <p className="text-xs font-medium text-sf-ink-soft">Phone</p>
                <a className="text-sm text-sf-ink" href={`tel:${siteDetails.contactPhone}`}>
                  {siteDetails.contactPhone}
                </a>
              </div>
            ) : null}
            {siteDetails.whatsappNumber ? (
              <a
                className="inline-block rounded-md px-4 py-2 text-sm font-semibold text-white"
                href={`https://wa.me/${siteDetails.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
                  `Hi ${siteDetails.storeName}, I'd like to know more about your products.`
                )}`}
                rel="noopener noreferrer"
                style={{ backgroundColor: accent }}
                target="_blank"
              >
                Chat on WhatsApp
              </a>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-sf-ink-soft">{siteDetails.storeName} hasn&apos;t added contact details yet.</p>
        )}
      </main>

      <StoreFooter companyCode={companyCode} site={site} />
    </>
  );
}
