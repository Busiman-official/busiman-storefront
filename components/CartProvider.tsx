"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { cartLineKey, clearCart, readCart, writeCart, type CartItem } from "@/lib/cart";

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  /** "Buy now" — REPLACES the cart with exactly this one line, rather than merging into whatever
   * was already there (addItem's behavior). Clicking "Buy now" twice (e.g. the shopper went back
   * and clicked it again) must land on a checkout for this one purchase, not a cart that's quietly
   * accumulated every previous click's quantity. */
  buyNow: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (slug: string, variantId: string | undefined, quantity: number) => void;
  removeItem: (slug: string, variantId: string | undefined) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ companyCode, children }: { companyCode: string; children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Cart is per-viewer browser storage, read only after mount (avoids SSR/client hydration
  // mismatch, since the server always renders an empty cart).
  useEffect(() => {
    setItems(readCart(companyCode));
  }, [companyCode]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const key = cartLineKey(item);
        const existing = prev.find((p) => cartLineKey(p) === key);
        const next = existing
          ? prev.map((p) => (cartLineKey(p) === key ? { ...p, quantity: p.quantity + quantity } : p))
          : [...prev, { ...item, quantity }];
        writeCart(companyCode, next);
        return next;
      });
    },
    [companyCode]
  );

  const buyNow = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      const next: CartItem[] = [{ ...item, quantity }];
      writeCart(companyCode, next);
      setItems(next);
    },
    [companyCode]
  );

  const updateQuantity = useCallback(
    (slug: string, variantId: string | undefined, quantity: number) => {
      setItems((prev) => {
        const key = cartLineKey({ slug, variantId });
        const next =
          quantity <= 0 ? prev.filter((p) => cartLineKey(p) !== key) : prev.map((p) => (cartLineKey(p) === key ? { ...p, quantity } : p));
        writeCart(companyCode, next);
        return next;
      });
    },
    [companyCode]
  );

  const removeItem = useCallback(
    (slug: string, variantId: string | undefined) => updateQuantity(slug, variantId, 0),
    [updateQuantity]
  );

  const clear = useCallback(() => {
    clearCart(companyCode);
    setItems([]);
  }, [companyCode]);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalAmount = useMemo(() => items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, totalCount, totalAmount, addItem, buyNow, updateQuantity, removeItem, clear }),
    [items, totalCount, totalAmount, addItem, buyNow, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
