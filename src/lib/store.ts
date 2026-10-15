"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, SelectedOption } from "./types";
import { generateId } from "./utils";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isConfigOpen: boolean;
  configSlug: string | null;
  aiOpen: boolean;
  addItem: (
    menuItemSlug: string,
    name: string,
    basePrice: number,
    selectedOptions: SelectedOption[],
    quantity?: number,
    specialInstructions?: string
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;
  setConfigOpen: (open: boolean, slug?: string | null) => void;
  setAiOpen: (open: boolean) => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isConfigOpen: false,
      configSlug: null,
      aiOpen: false,

      addItem: (menuItemSlug, name, basePrice, selectedOptions, quantity = 1, specialInstructions) => {
        const adjustments = selectedOptions.reduce(
          (sum, opt) => sum + (opt.priceAdjustment || 0),
          0
        );
        const unitPrice = basePrice + adjustments;

        // Check if same item with exact same options exists
        const existingItem = get().items.find(
          (item) =>
            item.menuItemSlug === menuItemSlug &&
            JSON.stringify(
              [...item.selectedOptions].sort((a, b) =>
                (a.groupSlug + a.optionName).localeCompare(b.groupSlug + b.optionName)
              )
            ) ===
              JSON.stringify(
                [...selectedOptions].sort((a, b) =>
                  (a.groupSlug + a.optionName).localeCompare(b.groupSlug + b.optionName)
                )
              )
        );

        if (existingItem) {
          set({
            items: get().items.map((item) =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          const newItem: CartItem = {
            id: generateId(),
            menuItemSlug,
            name,
            basePrice,
            unitPrice,
            quantity,
            selectedOptions,
            specialInstructions,
            addedAt: Date.now(),
          };
          set({ items: [...get().items, newItem] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      setCartOpen: (open) => set({ isOpen: open }),
      setConfigOpen: (open, slug = null) =>
        set({ isConfigOpen: open, configSlug: slug }),
      setAiOpen: (open) => set({ aiOpen: open }),

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "koreyaki-cart",
    }
  )
);
