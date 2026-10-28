/**
 * Proxies the admin editor's logo upload to Express — same cookie-forwarding pattern as
 * draft/route.ts. Forwards the incoming multipart body as-is (reading it as FormData and handing
 * it straight back to fetch lets fetch set its own correct boundary header, rather than this route
 * trying to re-serialize the file itself).
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
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/admin/upload-logo?token=${encodeURIComponent(token)}`,
    { method: "POST", body: formData, cache: "no-store" }
  );
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
