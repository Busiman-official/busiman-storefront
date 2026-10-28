"use client";

/**
 * Keeps every ordinary in-page link (product tiles, footer links, cart/checkout, search results,
 * category chips, "Load more"…) from ever taking the merchant out of the admin editor. Those links
 * are built by components shared with the real public storefront (StoreFooter, ClassicTemplate's
 * product grid, etc.) and correctly point at `/s/{companyCode}/...` — rewriting every one of them
 * individually to know about `/admin` would mean touching a long tail of components and re-breaking
 * this every time a new link is added. Instead this listens at the document level, once, and
 * rewrites any same-store internal link's target to its `/admin` equivalent before the browser
 * navigates — so the set of "pages that stay inside the editor" is exactly "every page that has an
 * admin mirror route", not whatever individual links happened to be updated.
 *
 * CAPTURE phase is load-bearing here, not a stylistic choice: every one of these links is a
 * next/link `<Link>`, which attaches its OWN click handler directly on the `<a>` that calls
 * `preventDefault()` and does its own `router.push(originalHref)` — and that element-level handler
 * always runs before a same-type listener added at the document in the bubble phase would. A bubble
 * listener here would see `e.defaultPrevented` already true (from Link) and correctly bail out via
 * the modified-click guard below, meaning it would NEVER actually intercept anything — which is
 * exactly the bug this component shipped with the first time: every click looked "already handled"
 * by the time the bubble-phase listener ran, so links kept escaping the editor. Listening on the
 * capture phase runs this handler BEFORE the click reaches the `<a>` at all, so `stopPropagation()`
 * here stops Link's own handler from ever firing.
 */
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AdminNavGuard({ companyCode }: { companyCode: string }) {
  const router = useRouter();

  useEffect(() => {
    const publicRoot = `/s/${companyCode}`;
    const publicPrefix = `${publicRoot}/`;
    const adminPrefix = `${publicRoot}/admin`;

    function handleClick(e: MouseEvent) {
      // Modified clicks (open in new tab, etc.) pass through untouched — this only concerns itself
      // with a plain same-tab left click.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor || !anchor.href) return;
      if (anchor.target && anchor.target !== "_self") return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.origin);
      } catch {
        return;
      }
      // External links, tel:/mailto:/wa.me — different origin already, never touched.
      if (url.origin !== window.location.origin) return;

      const path = url.pathname;
      if (path === adminPrefix || path.startsWith(`${adminPrefix}/`)) return; // already inside admin
      if (path !== publicRoot && !path.startsWith(publicPrefix)) return; // not this store's site at all

      // Runs ahead of next/link's own click handler (capture phase — see header comment), so this
      // has to stop the event from ever reaching it, not just prevent the browser's own navigation.
      e.preventDefault();
      e.stopPropagation();
      const rest = path === publicRoot ? "" : path.slice(publicRoot.length);
      router.push(`${adminPrefix}${rest}${url.search}${url.hash}`);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [companyCode, router]);

  return null;
}
