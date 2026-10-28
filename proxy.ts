/**
 * Host-header routing — one deployment serves every tenant's storefront. Resolves a request's
 * subdomain OR a verified custom domain (Phase 3) to a companyCode and rewrites it into
 * /s/[companyCode], so page code never has to parse hostnames itself.
 * See specs/ecommerce_storefront.spec.md §3.1 (Vercel "Platforms" pattern) and ADR-002/003.
 * Named `proxy.ts` per Next.js 16's renamed middleware convention (the old `middleware.ts` file is
 * deprecated as of this version).
 *
 * Deliberately `cache: "no-store"` on the custom-domain lookup — ONE cache layer (the server's own
 * resolve-domain cache, ~5min TTL, busted on every domain status change) rather than two
 * uncoordinated ones. An earlier version of this app's catalog/site fetches made exactly this
 * mistake (see lib/api.ts's own header comment for the real bug it caused) — not repeating it here.
 */
import { NextRequest, NextResponse } from "next/server";
import { resolveCompanyCodeFromHost } from "./lib/resolveTenant";

export async function proxy(req: NextRequest) {
  const companyCode = await resolveCompanyCodeFromHost(req.headers.get("host") || "", req.nextUrl.searchParams);
  if (!companyCode) return NextResponse.next();

  // Every in-app <Link> is built as an absolute `/s/{companyCode}/...` path (see AdminNavGuard.tsx's
  // header comment for why) — so a client-side navigation's request path already carries that
  // prefix. Only the very first request into a tenant (bare host, no path) doesn't. Prepending
  // unconditionally would double the prefix on every second+ navigation; only rewrite when it's
  // actually missing.
  const encoded = encodeURIComponent(companyCode);
  const publicRoot = `/s/${encoded}`;
  if (req.nextUrl.pathname === publicRoot || req.nextUrl.pathname.startsWith(`${publicRoot}/`)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  const suffix = req.nextUrl.pathname === "/" ? "" : req.nextUrl.pathname;
  url.pathname = `${publicRoot}${suffix}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml).*)"],
};
