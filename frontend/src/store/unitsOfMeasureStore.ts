import { create } from "zustand"
import { getUnitsOfMeasure, createUnitOfMeasure, deleteUnitOfMeasure, updateUnitOfMeasure } from "@/services/api/unitsOfMeasure";
import type { UnitOfMeasure, CreateUnitOfMeasurePayload, UpdateUnitOfMeasurePayload } from "@/services/api/unitsOfMeasure";

interface UnitsOfMeasureState {
  items: UnitOfMeasure[]
  loading: boolean
  error: string | null

  fetch: () => Promise<void>
  add: (data: CreateUnitOfMeasurePayload) => Promise<void>
  edit: (id: string, data: UpdateUnitOfMeasurePayload) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useUnitsOfMeasureStore = create<UnitsOfMeasureState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async () => {
    try {
      set({ loading: true })
      const res = await getUnitsOfMeasure()
      if (res.success) set({ items: res.data || [] })
      else set({ error: res.message || "Error fetching units of measure" })
    } finally {
      set({ loading: false })
    }
  },

  add: async (payload) => {
    const res = await createUnitOfMeasure(payload)
    if (res.success && res.data) {
      set({ items: [...get().items, res.data] })
    }
  },

  edit: async (id, payload) => {
    const res = await updateUnitOfMeasure(id, payload)
    if (res.success && res.data) {
      const updated = get().items.map((p) => (p._id === id ? res.data as UnitOfMeasure : p))
      set({ items: updated })
    }
  },

  remove: async (id) => {
    const res = await deleteUnitOfMeasure(id)
    if (res.success) {
      set({ items: get().items.filter((p) => p._id !== id) })
    }
  }
}))
