import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { fetchProduct, fetchSiteConfig } from "@/lib/api";
import { ProductPageBody } from "./ProductPageBody";

/** Builds an absolute canonical URL from the ACTUAL request host — correct for both
 * {companyCode}.busiman.org and any tenant's verified custom domain, since Next.js is the real
 * server receiving the request with that exact Host header either way (no per-tenant domain
 * lookup needed). Avoids duplicate-content SEO penalties across a tenant's two reachable hosts. */
async function canonicalUrl(path: string): Promise<string | undefined> {
  const h = await headers();
  const host = h.get("host");
  if (!host) return undefined;
  const proto = h.get("x-forwarded-proto") || "https";
  return `${proto}://${host}${path}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ companyCode: string; slug: string }>;
}): Promise<Metadata> {
  const { companyCode, slug } = await params;
  const [site, product] = await Promise.all([fetchSiteConfig(companyCode), fetchProduct(companyCode, slug)]);
  if (!site || !product) return {};
  // Social-share previews can't render a video — always the first still image, never the first
  // media item regardless of type.
  const ogImage = product.media.find((m) => m.type === "image")?.url;
  const title = product.seoTitle || `${product.name} — ${site.siteDetails.storeName}`;
  const description = product.seoDescription || product.description || `Buy ${product.name} at ${site.siteDetails.storeName}.`;
  const canonical = await canonicalUrl(`/s/${companyCode}/products/${slug}`);
  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: site.siteDetails.storeName,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ companyCode: string; slug: string }>;
}) {
  const { companyCode, slug } = await params;
  const [site, product] = await Promise.all([fetchSiteConfig(companyCode), fetchProduct(companyCode, slug)]);
  if (!site || !product) notFound();

  return <ProductPageBody companyCode={companyCode} homeHref={`/s/${companyCode}`} product={product} site={site} />;
}
