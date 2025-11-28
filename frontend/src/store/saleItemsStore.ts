import { create } from "zustand";
import { getSaleItems, createSaleItem, createManySaleItem, deleteSaleItem, updateSaleItem } from "@/services/api/saleItems"
import type { SaleItem, CreateSaleItemPayload, UpdateSaleItemPayload } from "@/services/api/saleItems"


interface SaleItemsState {
  items: SaleItem[];
  loading: boolean
  error: string | null


  fetch: () => Promise<void>
  add: (data: CreateSaleItemPayload) => Promise<void>
  edit: (id: string, data: UpdateSaleItemPayload) => Promise<void>
  remove: (id: string) => Promise<void>
  clear: () => void;
  addMany: (newItems: CreateSaleItemPayload[]) => Promise<void>;
}

export const useSaleItemsStore = create<SaleItemsState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async () => {
    try {
      set({ loading: true })
      const res = await getSaleItems()
      if (res.success) set({ items: res.data || [] })
      else set({ error: res.message || "Error fetching sale items" })
    } finally {
      set({ loading: false })
    }
  },

  add: async (payload) => {
    const res = await createSaleItem(payload)
    if (res.success && res.data) {
      set({ items: [...get().items, res.data] })
    }
  },

  edit: async (id, payload) => {
    const res = await updateSaleItem(id, payload)
    if (res.success && res.data) {
      const updated = get().items.map((p) => (p._id === id ? res.data as SaleItem : p))
      set({ items: updated })
    }
  },

  remove: async (id) => {
    const res = await deleteSaleItem(id)
    if (res.success) {
      set({ items: get().items.filter((p) => p._id !== id) })
    }
  },

  clear: () => set({ items: [] }),

  addMany: async (payload) => {
    const res = await createManySaleItem(payload)
    if (res.success && res.data) {
      set({ items: [...get().items, res.data] })
    }
  },
}));
