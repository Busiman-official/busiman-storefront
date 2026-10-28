import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ companyCode: string }> }) {
  const { companyCode } = await params;
  const response = NextResponse.json({ success: true });
  response.cookies.delete(`sf_admin_${companyCode}`);
  return response;
}
