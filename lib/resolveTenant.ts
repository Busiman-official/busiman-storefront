/**
 * Host → companyCode resolution, shared between proxy.ts (rewrites every page request) and
 * sitemap.ts (excluded from the proxy matcher, since /sitemap.xml must stay at the root path for
 * crawlers — so it resolves the tenant itself, from the same Host header, via this same logic).
 */
const ROOT_DOMAIN = (process.env.ROOT_DOMAIN || "busiman.org").toLowerCase();

function apiBase(): string {
  const base = process.env.SERVICE_API_BASE_URL?.trim().replace(/\/+$/, "");
  if (!base) throw new Error("SERVICE_API_BASE_URL is not configured");
  return base;
}

async function resolveCustomDomain(host: string): Promise<string | null> {
  try {
    const res = await fetch(`${apiBase()}/api/v1/storefront/resolve-domain/${encodeURIComponent(host)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.companyCode ?? null;
  } catch {
    return null;
  }
}

export async function resolveCompanyCodeFromHost(rawHost: string, searchParams?: URLSearchParams): Promise<string | null> {
  const host = rawHost.split(":")[0].toLowerCase();

  if (host === ROOT_DOMAIN || host === `www.${ROOT_DOMAIN}`) return null;

  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = host.slice(0, -(`.${ROOT_DOMAIN}`.length));
    return sub && sub !== "www" ? sub : null;
  }

  if (host === "localhost" || host.endsWith(".localhost") || host.startsWith("127.0.0.1")) {
    return searchParams?.get("company") ?? null;
  }

  return resolveCustomDomain(host);
}
