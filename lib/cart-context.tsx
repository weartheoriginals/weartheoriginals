'use client';

import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

export type CartItem = {
  lineId: string;
  slug: string;
  product_id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  customizations: Record<string, string>;
  variantIds: string[];
};

type AddItemInput = Omit<CartItem, 'lineId' | 'quantity'> & { quantity?: number };

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: AddItemInput) => void;
  removeItem: (lineId: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function buildLineId(slug: string, customizations: Record<string, string>) {
  const customKey = Object.entries(customizations)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
  return `${slug}__${customKey}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  function addItem(input: AddItemInput) {
    const lineId = buildLineId(input.slug, input.customizations);
    const quantityToAdd = input.quantity ?? 1;

    setItems(prev => {
      const existing = prev.find(item => item.lineId === lineId);
      if (existing) {
        return prev.map(item => (item.lineId === lineId ? { ...item, quantity: item.quantity + quantityToAdd } : item));
      }
      return [...prev, { ...input, lineId, quantity: quantityToAdd }];
    });
  }

  function removeItem(lineId: string) {
    setItems(prev => prev.filter(item => item.lineId !== lineId));
  }

  function updateQuantity(lineId: string, quantity: number) {
    if (quantity < 1) {
      removeItem(lineId);
      return;
    }
    setItems(prev => prev.map(item => (item.lineId === lineId ? { ...item, quantity } : item)));
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const value: CartContextValue = { items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
