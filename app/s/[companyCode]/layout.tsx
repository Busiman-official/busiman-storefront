import { CartProvider } from "@/components/CartProvider";

export default async function StorefrontSectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ companyCode: string }>;
}) {
  const { companyCode } = await params;
  return <CartProvider companyCode={companyCode}>{children}</CartProvider>;
}
