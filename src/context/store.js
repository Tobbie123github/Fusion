import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cartAPI } from "../api";
// ─── THEME STORE ──────────────────────────────────────────────────────────────
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "obsidian",
      setTheme: (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        set({ theme });
      },
    }),
    { name: "fusion-theme" },
  ),
);

// ─── AUTH STORE ───────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem("fusion_token", token);
        set({ user, token });
        useCartStore.getState()._setUser(user);
      },
      logout: () => {
        localStorage.removeItem("fusion_token");
        localStorage.removeItem("fusion-auth");
        set({ user: null, token: null });
        useCartStore.getState()._setUser(null);
      },
    }),
    {
      name: "fusion-auth",
      partialize: (s) => ({ user: s.user, token: s.token }),
    },
  ),
);

// ─── CART STORE ───────────────────────────────────────────────────────────────
// ─── CART STORE ───────────────────────────────────────────────────────────────
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      synced: false,
      _user: null, // ← add this
      _setUser: (user) => set({ _user: user }), // ← add this

      // Call on app boot when user is logged in
      syncFromServer: async () => {
        try {
          const res = await cartAPI.getAll();
          const serverItems =
            res?.cart?.items || res?.data?.items || res?.items || [];
          const items = serverItems.map((i) => ({
            id: i.productid || i.productId || i.product_id,
            name: i.name,
            price: i.price,
            discount: i.discount || 0, // ← add
            imageUrl: i.imageUrl || [],
            size: i.size || null,
            quantity: i.quantity || 1,
          }));
          set({ items, synced: true });
        } catch {
          set({ synced: true });
        }
      },

      addItem: async (product, size = null, quantity = 1) => {
        const items = get().items;
        const key = `${product.id}-${size}`;
        const existing = items.find((i) => `${i.id}-${i.size}` === key);
        const price = product.discount > 0 ? product.discount : product.price; // ← effective price

        if (existing) {
          set({
            items: items.map((i) =>
              `${i.id}-${i.size}` === key
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                id: product.id,
                name: product.name,
                price: product.price,
                discount: product.discount || 0,
                imageUrl: product.imageUrl || [],
                category: product.category || "",
                size,
                quantity,
              },
            ],
          });
        }

        const authState = JSON.parse(
          localStorage.getItem("fusion-auth") || "{}",
        )?.state;
        const token = authState?.token || localStorage.getItem("fusion_token");
        const userId = authState?.user?.id;

        if (token && userId) {
          try {
            await cartAPI.addItem(product.id, userId, quantity, size, price); // ← pass price
          } catch (err) {
            console.error(
              "Cart sync failed:",
              err?.response?.data || err.message,
            );
          }
        }
      },

      removeItem: async (id, size) => {
        // 1. Optimistic local update
        set({
          items: get().items.filter((i) => !(i.id === id && i.size === size)),
        });

        // 2. Sync to backend if logged in
        if (localStorage.getItem("fusion_token")) {
          try {
            await cartAPI.removeItem(id);
          } catch (err) {
            console.error("Cart remove failed:", err);
          }
        }
      },

      updateQty: (id, size, qty) => {
        if (qty < 1) return;
        set({
          items: get().items.map((i) =>
            i.id === id && i.size === size ? { ...i, quantity: qty } : i,
          ),
        });
        // Local only — no update-qty endpoint on your backend
      },

      clearCart: async () => {
        set({ items: [] });

        if (localStorage.getItem("fusion_token")) {
          try {
            await cartAPI.clearAll();
          } catch (err) {
            console.error("Cart clear failed:", err);
          }
        }
      },

      get total() {
        return get().items.reduce(
          (s, i) => s + (i.discount > 0 ? i.discount : i.price) * i.quantity,
          0,
        );
      },

      get count() {
        return get().items.reduce((s, i) => s + i.quantity, 0);
      },
    }),
    { name: "fusion-cart" },
  ),
);
