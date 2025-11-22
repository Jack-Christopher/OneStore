import { create } from "zustand"
import { getCategories, createCategory, deleteCategory, updateCategory } from "@/services/api/categories"
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/services/api/categories"

interface CategoriesState {
  items: Category[]
  loading: boolean
  error: string | null

  fetch: () => Promise<void>
  add: (data: CreateCategoryPayload) => Promise<void>
  edit: (id: string, data: UpdateCategoryPayload) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async () => {
    try {
      set({ loading: true })
      const res = await getCategories()
      if (res.success) set({ items: res.data || [] })
      else set({ error: res.message || "Error fetching categories" })
    } finally {
      set({ loading: false })
    }
  },

  add: async (payload) => {
    const res = await createCategory(payload)
    if (res.success && res.data) {
      set({ items: [...get().items, res.data] })
    }
  },

  edit: async (id, payload) => {
    const res = await updateCategory(id, payload)
    if (res.success && res.data) {
      const updated = get().items.map((p) => (p._id === id ? res.data as Category : p))
      set({ items: updated })
    }
  },

  remove: async (id) => {
    const res = await deleteCategory(id)
    if (res.success) {
      set({ items: get().items.filter((p) => p._id !== id) })
    }
  }
}))
