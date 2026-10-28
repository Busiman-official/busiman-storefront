/** Proxies "Publish" to Express — see draft/route.ts for the shared cookie-forwarding pattern. */
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

  const res = await fetch(
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/admin/publish?token=${encodeURIComponent(token)}`,
    { method: "POST", cache: "no-store" }
  );
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
