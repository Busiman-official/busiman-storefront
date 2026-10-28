/**
 * Proxies the browser's live delivery-estimate lookup (shopper types a pincode, checkout shows the
 * real delivery charge immediately) to the Express API — same same-origin-only reasoning as the
 * checkout route in this same directory.
 */
import { NextRequest, NextResponse } from "next/server";

function apiBase(): string {
  const base = process.env.SERVICE_API_BASE_URL?.trim().replace(/\/+$/, "");
  if (!base) throw new Error("SERVICE_API_BASE_URL is not configured");
  return base;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const qs = req.nextUrl.search;
  const res = await fetch(`${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/delivery-estimate${qs}`, {
    cache: "no-store",
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
