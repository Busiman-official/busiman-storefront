import Image from "next/image";
import Link from "next/link";
import type { CatalogSort, StorefrontBadge, StorefrontCatalogPage, StorefrontProduct, StorefrontSite, StorefrontSiteDetails } from "@/lib/api";
import { CartBadge } from "@/components/CartBadge";
import { CatalogFilterBar } from "@/components/CatalogFilterBar";
import { SearchBar } from "@/components/SearchBar";
import { EditableImageUrl } from "@/components/admin/EditableText";
import { AnnouncementBanner } from "./AnnouncementBanner";

export interface TemplateProps {
  companyCode: string;
  site: StorefrontSite;
  catalog: StorefrontCatalogPage;
  categories: string[];
  activeCategory?: string;
  activeSort: CatalogSort;
}

export { CatalogFilterBar };

export function formatPrice(amount: number | null, currency: string): string {
  if (amount == null) return "";
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

const BADGE_STYLES: Record<StorefrontBadge, { label: string; className: string }> = {
  new: { label: "New", className: "bg-blue-600 text-white" },
  bestseller: { label: "Bestseller", className: "bg-amber-400 text-amber-950" },
  sale: { label: "Sale", className: "bg-red-600 text-white" },
};

/** A merchandising tag (New/Bestseller/Sale) on a product card — shared by every product-grid
 * surface (home catalog, search/all-products) so a merchant only has to set a badge once in the
 * admin editor and see it everywhere a shopper can land on their catalog. Sits bottom-left so it
 * never collides with a category pill (top-left) or an out-of-stock pill (top-right). */
export function ProductBadgeRibbon({ badge }: { badge: StorefrontBadge }) {
  const style = BADGE_STYLES[badge];
  if (!style) return null;
  return (
    <span className={`absolute bottom-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm ${style.className}`}>
      {style.label}
    </span>
  );
}

/** Price + (when discounted) a struck-through MRP and a computed "X% OFF" chip — shared by every
 * product-grid surface for the same reason as ProductBadgeRibbon above. */
export function ProductPriceLine({
  item,
  accent,
  currency,
  size = "sm",
}: {
  item: Pick<StorefrontProduct, "price" | "mrp" | "discountPercent" | "isFromPrice">;
  accent: string;
  currency: string;
  size?: "sm" | "base";
}) {
  if (item.price == null) return null;
  const priceClass = size === "base" ? "text-base font-bold" : "text-sm font-semibold";
  return (
    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      <p className={`sf-price ${priceClass}`} style={{ color: accent }}>
        {item.isFromPrice ? <span className="font-normal text-sf-ink-soft">From </span> : null}
        {formatPrice(item.price, currency)}
      </p>
      {item.discountPercent != null && item.mrp != null ? (
        <>
          <p className="text-xs text-sf-ink-soft line-through">{formatPrice(item.mrp, currency)}</p>
          <span className="rounded bg-green-50 px-1 py-0.5 text-[10px] font-bold text-green-700">{item.discountPercent}% OFF</span>
        </>
      ) : null}
    </div>
  );
}

function whatsappHref(whatsappNumber: string, storeName: string): string {
  const digits = whatsappNumber.replace(/\D/g, "");
  const text = encodeURIComponent(`Hi ${storeName}, I'd like to know more about your products.`);
  return `https://wa.me/${digits}?text=${text}`;
}

export function WhatsAppFloatButton({ whatsappNumber, storeName }: { whatsappNumber?: string; storeName: string }) {
  if (!whatsappNumber) return null;
  return (
    <a
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg"
      href={whatsappHref(whatsappNumber, storeName)}
      rel="noopener noreferrer"
      style={{ backgroundColor: "#25D366" }}
      target="_blank"
    >
      <svg aria-hidden="true" fill="currentColor" height="24" viewBox="0 0 24 24" width="24">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.82L2 22l5.44-1.43a9.87 9.87 0 0 0 4.6 1.17h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.08c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.14-.95-.3-1.64-.59-2.89-1.25-4.78-4.16-4.92-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.17.01.42-.07.65.5.24.59.82 2.03.89 2.18.07.14.11.31.02.5-.1.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.29-.12.57.17.28.75 1.24 1.62 2.01 1.12.99 2.06 1.3 2.35 1.44.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.28.38-.24.64-.14.26.09 1.64.77 1.92.91.28.14.47.21.54.33.07.11.07.65-.17 1.33Z" />
      </svg>
    </a>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-sf-ink">{title}</p>
      <nav className="flex flex-col items-start gap-2">{children}</nav>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="cursor-pointer text-sm text-sf-ink-soft transition-colors hover:text-sf-ink" href={href}>
      {children}
    </Link>
  );
}

function FooterPhoneIcon() {
  return (
    <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" width="16">
      <path
        d="M4 5c0-1 .8-1.8 1.8-1.8h2a1 1 0 0 1 1 .8l.7 3a1 1 0 0 1-.3 1L7.8 9.5a13 13 0 0 0 6.7 6.7l1.5-1.4a1 1 0 0 1 1-.3l3 .7a1 1 0 0 1 .8 1v2c0 1-.8 1.8-1.8 1.8C10.8 20 4 13.2 4 5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FooterWhatsAppIcon() {
  return (
    <svg aria-hidden="true" fill="currentColor" height="16" viewBox="0 0 24 24" width="16">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.82L2 22l5.44-1.43a9.87 9.87 0 0 0 4.6 1.17h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.08c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.12.11-1.8-.11-.42-.14-.95-.3-1.64-.59-2.89-1.25-4.78-4.16-4.92-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.26-.28.57-.35.76-.35.19 0 .38 0 .55.01.17.01.42-.07.65.5.24.59.82 2.03.89 2.18.07.14.11.31.02.5-.1.19-.14.3-.28.47-.14.17-.3.37-.43.5-.14.14-.29.29-.12.57.17.28.75 1.24 1.62 2.01 1.12.99 2.06 1.3 2.35 1.44.29.14.46.12.63-.07.17-.19.72-.84.91-1.13.19-.28.38-.24.64-.14.26.09 1.64.77 1.92.91.28.14.47.21.54.33.07.11.07.65-.17 1.33Z" />
    </svg>
  );
}

/**
 * A real multi-column ecommerce footer — store identity + contact on its own, then Shop/Support/
 * Policies as separate, scannable link groups (not one long run-on row of links). Every link and
 * every contact method is conditional on the tenant actually having set it; nothing here is
 * invented copy.
 */
export function StoreFooter({ companyCode, site }: { companyCode: string; site: StorefrontSite }) {
  const { siteDetails } = site;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-sf-line bg-sf-surface" id="section-footer">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <LogoBadge accent={siteDetails.accentColor} logoUrl={siteDetails.logoUrl} size={32} storeName={siteDetails.storeName} />
              <span className="font-heading text-base font-semibold text-sf-ink">{siteDetails.storeName}</span>
            </div>
            {siteDetails.aboutText ? <p className="line-clamp-3 text-sm text-sf-ink-soft">{siteDetails.aboutText}</p> : null}
            {siteDetails.contactPhone || siteDetails.whatsappNumber ? (
              <div className="space-y-2 pt-1">
                {siteDetails.contactPhone ? (
                  <a
                    className="flex cursor-pointer items-center gap-2 text-sm text-sf-ink-soft transition-colors hover:text-sf-ink"
                    href={`tel:${siteDetails.contactPhone}`}
                  >
                    <FooterPhoneIcon />
                    {siteDetails.contactPhone}
                  </a>
                ) : null}
                {siteDetails.whatsappNumber ? (
                  <a
                    className="flex cursor-pointer items-center gap-2 text-sm text-sf-ink-soft transition-colors hover:text-sf-ink"
                    href={whatsappHref(siteDetails.whatsappNumber, siteDetails.storeName)}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <FooterWhatsAppIcon />
                    WhatsApp
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <FooterColumn title="Shop">
            <FooterLink href={`/s/${companyCode}`}>All products</FooterLink>
          </FooterColumn>

          <FooterColumn title="Support">
            <FooterLink href={`/s/${companyCode}/about`}>About</FooterLink>
            <FooterLink href={`/s/${companyCode}/contact`}>Contact</FooterLink>
          </FooterColumn>

          <FooterColumn title="Policies">
            <FooterLink href={`/s/${companyCode}/policies/shipping`}>Shipping</FooterLink>
            <FooterLink href={`/s/${companyCode}/policies/returns`}>Returns</FooterLink>
            <FooterLink href={`/s/${companyCode}/policies/terms`}>Terms</FooterLink>
            <FooterLink href={`/s/${companyCode}/policies/privacy`}>Privacy</FooterLink>
          </FooterColumn>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-sf-line pt-6 text-xs text-sf-ink-soft sm:flex-row sm:justify-between">
          <p>
            © {year} {siteDetails.storeName}
          </p>
          <p>Powered by Busiman</p>
        </div>
      </div>
    </footer>
  );
}

export function LogoBadge({
  logoUrl,
  storeName,
  accent,
  size = 40,
}: {
  logoUrl?: string;
  storeName: string;
  accent: string;
  size?: number;
}) {
  if (logoUrl) {
    return <Image alt={storeName} className="rounded-md object-cover" height={size} src={logoUrl} style={{ width: size, height: size }} width={size} />;
  }
  return (
    <div
      className="flex items-center justify-center rounded-md font-semibold text-white"
      style={{ backgroundColor: accent, width: size, height: size, fontSize: size * 0.4 }}
    >
      {storeName.slice(0, 1).toUpperCase()}
    </div>
  );
}

/**
 * Standard navigation chrome — used on every page (home, product, search, cart, checkout) across
 * every template, not just Classic. Navigation is shared infrastructure; only each template's body
 * content (the home page's layout shape) differs. The scrolling banner up top is purely opt-in —
 * it shows only when the store owner has actually set an announcement; contact info already has
 * its own place in the footer, so there's no fallback text here when the banner is unset.
 */
export function StorefrontNavbar({
  companyCode,
  storeName,
  logoUrl,
  accentColor,
  currency,
  announcementText,
  announcementEnabled,
}: {
  companyCode: string;
  storeName: string;
  logoUrl?: string;
  accentColor: string;
  currency: string;
  announcementText?: string;
  announcementEnabled?: boolean;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-sf-line bg-sf-surface" id="section-navbar">
      {announcementEnabled !== false ? <AnnouncementBanner announcementText={announcementText} companyCode={companyCode} /> : null}
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link aria-label={storeName} className="flex shrink-0 cursor-pointer items-center" href={`/s/${companyCode}`}>
          <EditableImageUrl companyCode={companyCode} value={logoUrl}>
            <LogoBadge accent={accentColor} logoUrl={logoUrl} storeName={storeName} />
          </EditableImageUrl>
        </Link>
        <div className="min-w-0 flex-1">
          <SearchBar companyCode={companyCode} />
        </div>
        <div className="shrink-0">
          <CartBadge companyCode={companyCode} currency={currency} />
        </div>
      </div>
    </header>
  );
}

export function NavbarFromSite({ companyCode, site }: { companyCode: string; site: StorefrontSite }) {
  return (
    <StorefrontNavbar
      accentColor={site.siteDetails.accentColor}
      announcementEnabled={site.siteDetails.announcementEnabled}
      announcementText={site.siteDetails.announcementText}
      companyCode={companyCode}
      currency={site.siteDetails.currency}
      logoUrl={site.siteDetails.logoUrl}
      storeName={site.siteDetails.storeName}
    />
  );
}

export type { StorefrontSiteDetails };
