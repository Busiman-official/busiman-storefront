"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearCart, readCart, writeCart, type CartItem } from "@/lib/cart";

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  totalAmount: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
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
        const existing = prev.find((p) => p.slug === item.slug);
        const next = existing
          ? prev.map((p) => (p.slug === item.slug ? { ...p, quantity: p.quantity + quantity } : p))
          : [...prev, { ...item, quantity }];
        writeCart(companyCode, next);
        return next;
      });
    },
    [companyCode]
  );

  const updateQuantity = useCallback(
    (slug: string, quantity: number) => {
      setItems((prev) => {
        const next =
          quantity <= 0 ? prev.filter((p) => p.slug !== slug) : prev.map((p) => (p.slug === slug ? { ...p, quantity } : p));
        writeCart(companyCode, next);
        return next;
      });
    },
    [companyCode]
  );

  const removeItem = useCallback((slug: string) => updateQuantity(slug, 0), [updateQuantity]);

  const clear = useCallback(() => {
    clearCart(companyCode);
    setItems([]);
  }, [companyCode]);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalAmount = useMemo(() => items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, totalCount, totalAmount, addItem, updateQuantity, removeItem, clear }),
    [items, totalCount, totalAmount, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
