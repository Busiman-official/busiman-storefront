/**
 * Proxies the PIN-entry POST to Express, and on success sets the httpOnly session cookie —
 * mirrors checkout/route.ts's "storefront's own origin is the only one the browser talks to"
 * pattern. The cookie itself (not the token value) is what the browser ever sees; admin/page.tsx
 * reads it server-side and re-validates with Express on every load.
 */
import { NextRequest, NextResponse } from "next/server";

const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // matches storefrontAdminSession.util.ts's 7d JWT expiry

function apiBase(): string {
  const base = process.env.SERVICE_API_BASE_URL?.trim().replace(/\/+$/, "");
  if (!base) throw new Error("SERVICE_API_BASE_URL is not configured");
  return base;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const body = await req.text();
  const res = await fetch(`${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok || !json?.data?.token) {
    return NextResponse.json(json, { status: res.status });
  }

  const response = NextResponse.json(json, { status: res.status });
  response.cookies.set(`sf_admin_${companyCode}`, json.data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
