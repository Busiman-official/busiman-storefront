import { NextRequest, NextResponse } from "next/server";

function apiBase(): string {
  const base = process.env.SERVICE_API_BASE_URL?.trim().replace(/\/+$/, "");
  if (!base) throw new Error("SERVICE_API_BASE_URL is not configured");
  return base;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ companyCode: string; checkoutId: string }> }
) {
  const { companyCode, checkoutId } = await params;
  const res = await fetch(
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/checkout/${encodeURIComponent(checkoutId)}/confirm`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}", cache: "no-store" }
  );
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
