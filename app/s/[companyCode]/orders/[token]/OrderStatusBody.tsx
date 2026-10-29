import { NavbarFromSite, StoreFooter, formatPrice } from "@/components/templates/shared";
import type { OrderStatus, StorefrontSite } from "@/lib/api";

export function OrderStatusBody({ companyCode, site, order }: { companyCode: string; site: StorefrontSite; order: OrderStatus }) {
  return (
    <>
      <NavbarFromSite companyCode={companyCode} site={site} />

      <main className="mx-auto w-full max-w-md flex-1 space-y-6 px-4 py-12" id="section-page-content">
        <h1 className="font-heading text-center text-xl font-semibold text-sf-ink">Order status</h1>

        <div className="space-y-2 rounded-lg border border-sf-line bg-sf-surface p-5 text-center">
          {order.status === "paid" ? (
            <>
              <p className="text-lg font-semibold text-sf-ink">
                {order.orderNumbers.length === 1
                  ? `Order ${order.orderNumbers[0]}`
                  : `Orders ${order.orderNumbers.join(", ")}`}
              </p>
              <p className="sf-price text-sm text-green-700">
                {order.paymentMethod === "cod"
                  ? `Confirmed — pay ${formatPrice(order.amount, order.currency)} on delivery`
                  : `Paid, ${formatPrice(order.amount, order.currency)}`}
              </p>
            </>
          ) : order.status === "pending" ? (
            <p className="text-sm text-sf-ink-soft">Payment is still processing — check back shortly.</p>
          ) : order.status === "cancelled" ? (
            <>
              <p className="text-sm font-medium text-sf-ink">
                {order.orderNumbers.length === 1
                  ? `Order ${order.orderNumbers[0]} was cancelled`
                  : `Orders ${order.orderNumbers.join(", ")} were cancelled`}
              </p>
              {order.refundedAmount != null ? (
                <p className="text-sm text-sf-ink-soft">{formatPrice(order.refundedAmount, order.currency)} was refunded to your payment method.</p>
              ) : null}
            </>
          ) : (
            <>
              <p className="text-sm text-red-700">Payment was not completed</p>
              {order.failureReason ? <p className="text-xs text-sf-ink-soft">{order.failureReason}</p> : null}
            </>
          )}
          <p className="pt-2 text-xs text-sf-ink-soft">Placed {new Date(order.createdAt).toLocaleString("en-IN")}</p>
        </div>

        {order.shipment.shippedAt ? (
          <div className="space-y-1.5 rounded-lg border border-sf-line bg-sf-surface p-5">
            <p className="text-sm font-medium text-sf-ink">Shipped</p>
            {order.shipment.carrier ? <p className="text-sm text-sf-ink-soft">Carrier: {order.shipment.carrier}</p> : null}
            {order.shipment.trackingNumber ? (
              <p className="text-sm text-sf-ink-soft">Tracking number: {order.shipment.trackingNumber}</p>
            ) : null}
            {order.shipment.trackingUrl ? (
              <a
                className="inline-block text-sm font-medium underline"
                href={order.shipment.trackingUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                Track your package
              </a>
            ) : null}
          </div>
        ) : null}
      </main>

      <StoreFooter companyCode={companyCode} site={site} />
    </>
  );
}
