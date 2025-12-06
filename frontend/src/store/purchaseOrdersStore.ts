import { create } from "zustand"
import {
  getPurchaseOrders,
  createPurchaseOrder,
  createPurchaseOrderWithItems,
  deletePurchaseOrder,
  updatePurchaseOrder,
  receivePurchaseOrder
} from "@/services/api/purchaseOrders"
import type {
  PurchaseOrder,
  CreatePurchaseOrderPayload,
  CreatePurchaseOrderWithItemsPayload,
  UpdatePurchaseOrderPayload
} from "@/services/api/purchaseOrders"

interface PurchaseOrdersState {
  items: PurchaseOrder[]
  lastAdded: PurchaseOrder | null
  loading: boolean
  error: string | null
  fetch: () => Promise<void>
  add: (data: CreatePurchaseOrderPayload) => Promise<PurchaseOrder | null>
  addWithItems: (data: CreatePurchaseOrderWithItemsPayload) => Promise<PurchaseOrder | null>
  edit: (id: string, data: UpdatePurchaseOrderPayload) => Promise<void>
  remove: (id: string) => Promise<void>
  receive: (id: string) => Promise<void>
}

export const usePurchaseOrdersStore = create<PurchaseOrdersState>((set, get) => ({
  items: [],
  lastAdded: null,
  loading: false,
  error: null,

  fetch: async () => {
    try {
      set({ loading: true })
      const res = await getPurchaseOrders()
      if (res.success) set({ items: res.data || [] })
      else set({ error: res.message || "Error fetching purchase orders" })
    } finally {
      set({ loading: false })
    }
  },

  add: async (payload) => {
    const res = await createPurchaseOrder(payload)
    if (res.success && res.data) {
      set({ items: [...get().items, res.data] })
      set({ lastAdded: res.data })
      return res.data
    }
    return null
  },

  addWithItems: async (payload) => {
    const res = await createPurchaseOrderWithItems(payload)
    if (res.success && res.data) {
      set({ items: [...get().items, res.data] })
      set({ lastAdded: res.data })
      return res.data
    }
    return null
  },

  edit: async (id, payload) => {
    const res = await updatePurchaseOrder(id, payload)
    if (res.success && res.data) {
      const updated = get().items.map((p) => (p._id === id ? res.data as PurchaseOrder : p))
      set({ items: updated })
    }
  },

  remove: async (id) => {
    const res = await deletePurchaseOrder(id)
    if (res.success) {
      set({ items: get().items.filter((p) => p._id !== id) })
    }
  },

  receive: async (id) => {
    const res = await receivePurchaseOrder(id)
    if (res.success && res.data) {
      const updated = get().items.map((p) => (p._id === id ? res.data as PurchaseOrder : p))
      set({ items: updated })
    }
  }
}))

