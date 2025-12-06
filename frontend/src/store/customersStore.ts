import { create } from "zustand"
import { getCustomers, createCustomer, deleteCustomer, updateCustomer } from "@/services/api/customers"
import type { Customer, CreateCustomerPayload, UpdateCustomerPayload } from "@/services/api/customers"

interface CustomersState {
  items: Customer[]
  loading: boolean
  error: string | null
  fetch: () => Promise<void>
  add: (data: CreateCustomerPayload) => Promise<void>
  edit: (id: string, data: UpdateCustomerPayload) => Promise<void>
  remove: (id: string) => Promise<void>
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetch: async () => {
    try {
      set({ loading: true })
      const res = await getCustomers()
      if (res.success) set({ items: res.data || [] })
      else set({ error: res.message || "Error fetching customers" })
    } finally {
      set({ loading: false })
    }
  },

  add: async (payload) => {
    const res = await createCustomer(payload)
    if (res.success && res.data) {
      set({ items: [...get().items, res.data] })
    }
  },

  edit: async (id, payload) => {
    const res = await updateCustomer(id, payload)
    if (res.success && res.data) {
      const updated = get().items.map((p) => (p._id === id ? res.data as Customer : p))
      set({ items: updated })
    }
  },

  remove: async (id) => {
    const res = await deleteCustomer(id)
    if (res.success) {
      set({ items: get().items.filter((p) => p._id !== id) })
    }
  }
}))

