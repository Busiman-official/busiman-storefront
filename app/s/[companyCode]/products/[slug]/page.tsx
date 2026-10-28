import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchProduct, fetchSiteConfig } from "@/lib/api";
import { ProductPageBody } from "./ProductPageBody";

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
  return {
    title,
    description,
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
