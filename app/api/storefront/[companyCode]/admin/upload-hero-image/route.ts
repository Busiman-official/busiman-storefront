/**
 * Proxies the admin editor's Hero background-image upload to Express — same pattern as
 * upload-logo/route.ts, just a different Express endpoint on the other end.
 */
import { NextRequest, NextResponse } from "next/server";

function apiBase(): string {
  const base = process.env.SERVICE_API_BASE_URL?.trim().replace(/\/+$/, "");
  if (!base) throw new Error("SERVICE_API_BASE_URL is not configured");
  return base;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const token = req.cookies.get(`sf_admin_${companyCode}`)?.value;
  if (!token) return NextResponse.json({ success: false, message: "Not signed in" }, { status: 401 });

  const formData = await req.formData();
  const res = await fetch(
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/admin/upload-hero-image?token=${encodeURIComponent(token)}`,
    { method: "POST", body: formData, cache: "no-store" }
  );
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
