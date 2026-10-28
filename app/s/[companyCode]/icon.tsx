/**
 * Per-tenant favicon — Next's file-convention icon route, propagated automatically to every page
 * under this segment (no manual `<link rel="icon">` needed anywhere). Whatever the merchant most
 * recently uploaded as their logo IS the favicon — one upload, two places it shows up, matching
 * what a merchant actually expects ("I set my logo, why does the browser tab still show a generic
 * icon?"). `proxy.ts`'s rewrite matcher excludes the literal `/favicon.ico` path (so that one stays
 * a single shared fallback for the bare root domain), but this file lives under `/s/[companyCode]`
 * and is unaffected by that exclusion — each tenant's pages get their own.
 */
import { fetchSiteConfig } from "@/lib/api";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon({ params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const site = await fetchSiteConfig(companyCode);
  const logoUrl = site?.siteDetails.logoUrl;
  if (!logoUrl) {
    return new Response(null, { status: 404 });
  }

  try {
    const res = await fetch(logoUrl, { next: { revalidate: 3600 } });
    if (!res.ok) return new Response(null, { status: 404 });
    const buffer = await res.arrayBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": res.headers.get("content-type") || "image/png",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
