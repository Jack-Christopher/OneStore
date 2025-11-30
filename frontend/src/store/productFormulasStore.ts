import { create } from "zustand"
import { getProductFormulas, createProductFormula, deleteProductFormula, updateProductFormula } from "@/services/api/productFormulas"
import type { ProductFormula, CreateProductFormulaPayload, UpdateProductFormulaPayload } from "@/services/api/productFormulas"

interface ProductFormulasState {
  items: ProductFormula[]
  loading: boolean
  error: string | null

  fetch: () => Promise<void>
  add: (data: CreateProductFormulaPayload) => Promise<void>
  edit: (id: string, data: UpdateProductFormulaPayload) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useProductFormulasStore = create<ProductFormulasState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async () => {
    try {
      set({ loading: true })
      const res = await getProductFormulas()
      if (res.success) set({ items: res.data || [] })
      else set({ error: res.message || "Error fetching product formulas" })
    } finally {
      set({ loading: false })
    }
  },

  add: async (payload) => {
    const res = await createProductFormula(payload)
    if (res.success && res.data) {
      set({ items: [...get().items, res.data] })
    }
  },

  edit: async (id, payload) => {
    const res = await updateProductFormula(id, payload)
    if (res.success && res.data) {
      const updated = get().items.map((p) => (p._id === id ? res.data as ProductFormula : p))
      set({ items: updated })
    }
  },

  remove: async (id) => {
    const res = await deleteProductFormula(id)
    if (res.success) {
      set({ items: get().items.filter((p) => p._id !== id) })
    }
  }
}))
