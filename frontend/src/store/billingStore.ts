import { create } from "zustand"
import { getBillingDocuments, getBillingDocument, importFromKeyfacil } from "@/services/api/billing"
import type { BillingDocument, BillingDocumentType } from "@/services/api/billing"

interface BillingState {
  items: BillingDocument[]
  loading: boolean
  error: string | null
  documentType: BillingDocumentType | null
  fetch: (documentType: BillingDocumentType) => Promise<void>
  getOne: (documentType: BillingDocumentType, id: string) => Promise<BillingDocument | null>
  importFromKeyfacil: (file: File, documentType?: BillingDocumentType) => Promise<{ success: number; failed: number; errors: string[] }>
  setDocumentType: (type: BillingDocumentType | null) => void
  clear: () => void
}

export const useBillingStore = create<BillingState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  documentType: null,

  setDocumentType: (type) => {
    set({ documentType: type, items: [] })
  },

  fetch: async (documentType: BillingDocumentType) => {
    try {
      set({ loading: true, error: null })
      const res = await getBillingDocuments(documentType)
      if (res.success) {
        set({ items: res.data || [], documentType })
      } else {
        set({ error: res.message || "Error al obtener documentos" })
      }
    } catch (error: any) {
      set({ error: error.message || "Error al obtener documentos" })
    } finally {
      set({ loading: false })
    }
  },

  getOne: async (documentType: BillingDocumentType, id: string) => {
    try {
      const res = await getBillingDocument(documentType, id)
      if (res.success && res.data) {
        return res.data
      }
      return null
    } catch (error: any) {
      console.error("Error fetching document:", error)
      return null
    }
  },

  importFromKeyfacil: async (file: File, documentType?: BillingDocumentType) => {
    try {
      set({ loading: true, error: null })
      const res = await importFromKeyfacil(file, documentType)
      if (res.success && res.data) {
        return res.data
      } else {
        throw new Error(res.message || "Error al importar documentos")
      }
    } catch (error: any) {
      set({ error: error.message || "Error al importar documentos" })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  clear: () => {
    set({ items: [], documentType: null, error: null })
  }
}))

