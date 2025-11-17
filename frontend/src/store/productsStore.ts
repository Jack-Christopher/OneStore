import { create } from "zustand"
import { getProducts, createProduct, deleteProduct, updateProduct } from "@/services/api/products"
import type { Product, CreateProductPayload, UpdateProductPayload } from "@/services/api/products"

interface ProductsState {
  items: Product[]
  loading: boolean
  error: string | null

  fetch: () => Promise<void>
  add: (data: CreateProductPayload) => Promise<void>
  edit: (id: string, data: UpdateProductPayload) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async () => {
    try {
      set({ loading: true })
      const res = await getProducts()
      if (res.success) set({ items: res.data || [] })
      else set({ error: res.message || "Error fetching products" })
    } finally {
      set({ loading: false })
    }
  },

  add: async (payload) => {
    const res = await createProduct(payload)
    if (res.success && res.data) {
      set({ items: [...get().items, res.data] })
    }
  },

  edit: async (id, payload) => {
    const res = await updateProduct(id, payload)
    if (res.success && res.data) {
      const updated = get().items.map((p) => (p._id === id ? res.data as Product : p))
      set({ items: updated })
    }
  },

  remove: async (id) => {
    const res = await deleteProduct(id)
    if (res.success) {
      set({ items: get().items.filter((p) => p._id !== id) })
    }
  }
}))
