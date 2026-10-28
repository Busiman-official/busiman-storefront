/**
 * Proxies the admin editor's draft read/write to Express, forwarding the httpOnly session cookie
 * as Express's own `?token=` query param (same convention session/route.ts already relies on) —
 * the browser only ever talks to this same-origin route, never Express directly.
 */
import { NextRequest, NextResponse } from "next/server";

function apiBase(): string {
  const base = process.env.SERVICE_API_BASE_URL?.trim().replace(/\/+$/, "");
  if (!base) throw new Error("SERVICE_API_BASE_URL is not configured");
  return base;
}

function readToken(req: NextRequest, companyCode: string): string | null {
  return req.cookies.get(`sf_admin_${companyCode}`)?.value ?? null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const token = readToken(req, companyCode);
  if (!token) return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });

  const res = await fetch(
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/admin/draft?token=${encodeURIComponent(token)}`,
    { cache: "no-store" }
  );
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const token = readToken(req, companyCode);
  if (!token) return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });

  const body = await req.text();
  const res = await fetch(
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/admin/draft?token=${encodeURIComponent(token)}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body, cache: "no-store" }
  );
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
