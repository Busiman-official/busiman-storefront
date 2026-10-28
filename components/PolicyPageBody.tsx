import type { ReactNode } from "react";
import { NavbarFromSite, StoreFooter } from "@/components/templates/shared";
import type { StorefrontSite } from "@/lib/api";

export function PolicyPageBody({
  companyCode,
  site,
  title,
  children,
}: {
  companyCode: string;
  site: StorefrontSite;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <NavbarFromSite companyCode={companyCode} site={site} />

      <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 py-10 text-sm text-sf-ink-soft" id="section-page-content">
        <h1 className="font-heading text-xl font-semibold text-sf-ink">{title}</h1>
        {children}
      </main>

      <StoreFooter companyCode={companyCode} site={site} />
    </>
  );
}
