import { create } from "zustand"
import { getSales, createSale, deleteSale, updateSale } from "@/services/api/sales"
import type { Sale, CreateSalePayload, UpdateSalePayload } from "@/services/api/sales"

interface SalesState {
  items: Sale[]
  lastAdded: Sale | null
  loading: boolean
  error: string | null

  fetch: () => Promise<void>
  add: (data: CreateSalePayload) => Promise<void>
  edit: (id: string, data: UpdateSalePayload) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useSalesStore = create<SalesState>((set, get) => ({
  items: [],
  lastAdded: null,
  loading: false,
  error: null,

  fetch: async () => {
    try {
      set({ loading: true })
      const res = await getSales()
      if (res.success) set({ items: res.data || [] })
      else set({ error: res.message || "Error fetching sales" })
    } finally {
      set({ loading: false })
    }
  },

  add: async (payload) => {
    const res = await createSale(payload)
    if (res.success && res.data) {
      set({ items: [...get().items, res.data] });
      set({ lastAdded: res.data });
    }
  },

  edit: async (id, payload) => {
    const res = await updateSale(id, payload)
    if (res.success && res.data) {
      const updated = get().items.map((p) => (p._id === id ? res.data as Sale : p))
      set({ items: updated })
    }
  },

  remove: async (id) => {
    const res = await deleteSale(id)
    if (res.success) {
      set({ items: get().items.filter((p) => p._id !== id) })
    }
  }
}))
