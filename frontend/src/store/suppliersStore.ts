import { create } from "zustand"
import { getSuppliers, createSupplier, deleteSupplier, updateSupplier } from "@/services/api/suppliers"
import type { Supplier, CreateSupplierPayload, UpdateSupplierPayload } from "@/services/api/suppliers"

interface SuppliersState {
  items: Supplier[]
  loading: boolean
  error: string | null
  fetch: () => Promise<void>
  add: (data: CreateSupplierPayload) => Promise<void>
  edit: (id: string, data: UpdateSupplierPayload) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useSuppliersStore = create<SuppliersState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async () => {
    try {
      set({ loading: true })
      const res = await getSuppliers()
      if (res.success) set({ items: res.data || [] })
      else set({ error: res.message || "Error fetching suppliers" })
    } finally {
      set({ loading: false })
    }
  },

  add: async (payload) => {
    const res = await createSupplier(payload)
    if (res.success && res.data) {
      set({ items: [...get().items, res.data] })
    }
  },

  edit: async (id, payload) => {
    const res = await updateSupplier(id, payload)
    if (res.success && res.data) {
      const updated = get().items.map((p) => (p._id === id ? res.data as Supplier : p))
      set({ items: updated })
    }
  },

  remove: async (id) => {
    const res = await deleteSupplier(id)
    if (res.success) {
      set({ items: get().items.filter((p) => p._id !== id) })
    }
  }
}))

