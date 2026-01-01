import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product } from "@/types";

export interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) => {
        set((state) => {
          const existingItem = state.cart.find((item) => item.id === product.id);
          if (existingItem) {
            // ถ้ามีของอยู่แล้ว ให้เพิ่มจำนวน
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          // ถ้ายังไม่มี ให้เพิ่มใหม่
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        });
      },

      decreaseQuantity: (productId) => {
        set((state) => {
          const existingItem = state.cart.find((item) => item.id === productId);
          if (existingItem && existingItem.quantity > 1) {
            return {
              cart: state.cart.map((item) =>
                item.id === productId
                  ? { ...item, quantity: item.quantity - 1 }
                  : item
              ),
            };
          }
          // ถ้าเหลือ 1 ชิ้นแล้วกดลด จะลบออกจากตะกร้าเลย
          return {
            cart: state.cart.filter((item) => item.id !== productId),
          };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        }));
      },

      clearCart: () => set({ cart: [] }),

      getTotalPrice: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.selling_price * item.quantity, 0);
      },

      getTotalItems: () => {
        const { cart } = get();
        return cart.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "thanakorn-cart", // เก็บข้อมูลไว้ใน LocalStorage (ปิดเว็ปแล้วเปิดมาของยังอยู่)
    }
  )
);