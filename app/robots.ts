import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers();
  const host = headerList.get("host") || "";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/cart", "/checkout", "/search", "/orders/"] },
    ],
    sitemap: host ? `https://${host}/sitemap.xml` : undefined,
  };
}
