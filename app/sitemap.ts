import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { fetchCatalog, fetchSiteConfig } from "@/lib/api";
import { resolveCompanyCodeFromHost } from "@/lib/resolveTenant";

/**
 * /sitemap.xml is excluded from proxy.ts's rewrite matcher (crawlers expect it at the root path,
 * not under /s/[companyCode]), so this resolves the requesting tenant itself from the same Host
 * header proxy.ts would have used — see lib/resolveTenant.ts's header comment.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerList = await headers();
  const host = headerList.get("host") || "";
  const companyCode = await resolveCompanyCodeFromHost(host);
  if (!companyCode) return [];

  const site = await fetchSiteConfig(companyCode);
  if (!site) return [];

  const origin = `https://${host}`;
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: origin, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${origin}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${origin}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${origin}/policies/shipping`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/policies/returns`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/policies/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${origin}/policies/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  let page = 1;
  for (let i = 0; i < 50; i += 1) {
    const catalog = await fetchCatalog(companyCode, page);
    for (const item of catalog.items) {
      entries.push({
        url: `${origin}/products/${item.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
    if (!catalog.hasMore) break;
    page += 1;
  }

  return entries;
}
