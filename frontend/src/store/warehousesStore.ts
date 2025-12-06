import { create } from "zustand"
import { getWarehouses, createWarehouse, deleteWarehouse, updateWarehouse } from "@/services/api/warehouses"
import type { Warehouse, CreateWarehousePayload, UpdateWarehousePayload } from "@/services/api/warehouses"

interface WarehousesState {
  items: Warehouse[]
  loading: boolean
  error: string | null
  fetch: () => Promise<void>
  add: (data: CreateWarehousePayload) => Promise<void>
  edit: (id: string, data: UpdateWarehousePayload) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useWarehousesStore = create<WarehousesState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async () => {
    try {
      set({ loading: true })
      const res = await getWarehouses()
      if (res.success) set({ items: res.data || [] })
      else set({ error: res.message || "Error fetching warehouses" })
    } finally {
      set({ loading: false })
    }
  },

  add: async (payload) => {
    const res = await createWarehouse(payload)
    if (res.success && res.data) {
      set({ items: [...get().items, res.data] })
    }
  },

  edit: async (id, payload) => {
    const res = await updateWarehouse(id, payload)
    if (res.success && res.data) {
      const updated = get().items.map((p) => (p._id === id ? res.data as Warehouse : p))
      set({ items: updated })
    }
  },

  remove: async (id) => {
    const res = await deleteWarehouse(id)
    if (res.success) {
      set({ items: get().items.filter((p) => p._id !== id) })
    }
  }
}))

