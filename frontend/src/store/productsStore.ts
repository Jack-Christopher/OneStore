import { create } from "zustand"
import { getProducts, createProduct, deleteProduct, updateProduct, getMostSoldProducts, getProduct, importFromKeyfacil } from "@/services/api/products"
import type { Product, CreateProductPayload, UpdateProductPayload, MostSoldProduct } from "@/services/api/products"

interface ProductsState {
  items: Product[]
  mostSold: MostSoldProduct[]
  loading: boolean
  error: string | null
  fetch: () => Promise<void>
  fetchMostSold: () => Promise<void>
  add: (data: CreateProductPayload) => Promise<void>
  edit: (id: string, data: UpdateProductPayload) => Promise<void>
  remove: (id: string) => Promise<void>
  importFromKeyfacil: (file: File) => Promise<{ success: number; failed: number; errors: string[] }>
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  items: [],
  mostSold: [],
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

  fetchMostSold: async () => {
    try {
      set({ loading: true })
      const res = await getMostSoldProducts();
      console.log("res gmsp", res);
      if (res.success) set({ mostSold: res.data || [] })
      else set({ error: res.message || "Error fetching most sold products" })
    } finally {
      set({ loading: false })
    }
  },

  add: async (payload) => {
    const res = await createProduct(payload)
    if (res.success && res.data) {
      set({ items: [...get().items, res.data] })
    } else {
      // Throw error so it can be caught in the component
      const error: any = new Error(res.message || "Error creating product");
      error.response = { data: res };
      throw error;
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
  },

  importFromKeyfacil: async (file: File) => {
    try {
      set({ loading: true, error: null })
      const res = await importFromKeyfacil(file)
      if (res.success && res.data) {
        return res.data
      } else {
        throw new Error(res.message || "Error al importar productos")
      }
    } catch (error: any) {
      set({ error: error.message || "Error al importar productos" })
      throw error
    } finally {
      set({ loading: false })
    }
  }
}))
