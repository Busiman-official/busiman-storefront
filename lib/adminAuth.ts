/**
 * Shared auth check for every page under `/s/{companyCode}/admin/...` — re-verifies the session
 * cookie with Express on every single load (never trusts just because the cookie is present, since
 * a session can be invalidated server-side at any time; see storefront-admin.service.ts). Each
 * admin route calls this once instead of re-deriving the same cookie-read + verify dance, so a
 * future change to how sessions are checked only has to happen here.
 */
import { cookies } from "next/headers";
import { fetchSiteConfig, verifyStorefrontAdminSession, type StorefrontSite } from "./api";

export type AdminAuthResult =
  | { site: StorefrontSite; authenticated: true; token: string }
  | { site: StorefrontSite; authenticated: false };

/** Returns null only when the store itself doesn't exist (caller should notFound()) — an
 * unauthenticated visitor still gets a result, so every admin page can show the PIN login screen
 * instead of some pages 404ing and others showing a login form. */
export async function requireAdminAuth(companyCode: string): Promise<AdminAuthResult | null> {
  const site = await fetchSiteConfig(companyCode);
  if (!site) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(`sf_admin_${companyCode}`)?.value;
  const authenticated = token ? await verifyStorefrontAdminSession(companyCode, token) : false;

  if (!authenticated || !token) return { site, authenticated: false };
  return { site, authenticated: true, token };
}
