import { NextRequest, NextResponse } from "next/server";

function apiBase(): string {
  const base = process.env.SERVICE_API_BASE_URL?.trim().replace(/\/+$/, "");
  if (!base) throw new Error("SERVICE_API_BASE_URL is not configured");
  return base;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ companyCode: string; checkoutId: string }> }
) {
  const { companyCode, checkoutId } = await params;
  // Razorpay's signed result (optional) is forwarded as-is; the server verifies it. Only these
  // three string fields are passed on, nothing else the browser sends.
  const incoming = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const body: Record<string, string> = {};
  for (const key of ["razorpay_payment_id", "razorpay_order_id", "razorpay_signature"]) {
    if (typeof incoming[key] === "string") body[key] = incoming[key] as string;
  }
  const res = await fetch(
    `${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/checkout/${encodeURIComponent(checkoutId)}/confirm`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" }
  );
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
