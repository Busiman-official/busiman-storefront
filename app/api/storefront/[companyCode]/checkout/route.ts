/**
 * Proxies the browser's checkout POST to the Express API server-side, so the storefront's own
 * origin is the only one the browser ever talks to (no CORS configuration needed on the Express
 * side for arbitrary storefront subdomains/custom domains).
 */
import { NextRequest, NextResponse } from "next/server";

function apiBase(): string {
  const base = process.env.SERVICE_API_BASE_URL?.trim().replace(/\/+$/, "");
  if (!base) throw new Error("SERVICE_API_BASE_URL is not configured");
  return base;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const body = await req.text();
  const res = await fetch(`${apiBase()}/api/v1/storefront/${encodeURIComponent(companyCode)}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });
  const json = await res.json();
  return NextResponse.json(json, { status: res.status });
}
