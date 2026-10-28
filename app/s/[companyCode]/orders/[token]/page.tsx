import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchOrderStatus, fetchSiteConfig } from "@/lib/api";
import { OrderStatusBody } from "./OrderStatusBody";

export const metadata: Metadata = {
  title: "Order status",
  robots: { index: false, follow: false },
};

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ companyCode: string; token: string }>;
}) {
  const { companyCode, token } = await params;
  const [site, order] = await Promise.all([fetchSiteConfig(companyCode), fetchOrderStatus(companyCode, token)]);
  if (!site || !order) notFound();

  return <OrderStatusBody companyCode={companyCode} order={order} site={site} />;
}
