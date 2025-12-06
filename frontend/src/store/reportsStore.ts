import { create } from "zustand"
import {
  getDashboardStats,
  getSalesSummary,
  getPurchasesSummary,
  getTopProducts,
  getTopCategories,
  getLowStockProducts,
  getFinancialSummary,
  getSalesByPeriod
} from "@/services/api/reports"
import type {
  DashboardStats,
  SalesSummary,
  PurchasesSummary,
  TopProduct,
  TopCategory,
  LowStockProduct,
  FinancialSummary,
  SalesByPeriod,
  ReportFilters
} from "@/services/api/reports"

interface ReportsState {
  dashboardStats: DashboardStats | null
  salesSummary: SalesSummary | null
  purchasesSummary: PurchasesSummary | null
  topProducts: TopProduct[]
  topCategories: TopCategory[]
  lowStockProducts: LowStockProduct[]
  financialSummary: FinancialSummary | null
  salesByPeriod: SalesByPeriod[]
  loading: boolean
  error: string | null
  fetchDashboardStats: (filters?: ReportFilters) => Promise<void>
  fetchSalesSummary: (filters?: ReportFilters) => Promise<void>
  fetchPurchasesSummary: (filters?: ReportFilters) => Promise<void>
  fetchTopProducts: (limit?: number, filters?: ReportFilters) => Promise<void>
  fetchTopCategories: (limit?: number, filters?: ReportFilters) => Promise<void>
  fetchLowStockProducts: (limit?: number) => Promise<void>
  fetchFinancialSummary: (filters?: ReportFilters) => Promise<void>
  fetchSalesByPeriod: (period?: 'day' | 'week' | 'month', limit?: number) => Promise<void>
}

export const useReportsStore = create<ReportsState>((set) => ({
  dashboardStats: null,
  salesSummary: null,
  purchasesSummary: null,
  topProducts: [],
  topCategories: [],
  lowStockProducts: [],
  financialSummary: null,
  salesByPeriod: [],
  loading: false,
  error: null,

  fetchDashboardStats: async (filters) => {
    try {
      set({ loading: true })
      const res = await getDashboardStats(filters)
      if (res.success) set({ dashboardStats: res.data })
      else set({ error: res.message || "Error fetching dashboard stats" })
    } finally {
      set({ loading: false })
    }
  },

  fetchSalesSummary: async (filters) => {
    try {
      set({ loading: true })
      const res = await getSalesSummary(filters)
      if (res.success) set({ salesSummary: res.data })
      else set({ error: res.message || "Error fetching sales summary" })
    } finally {
      set({ loading: false })
    }
  },

  fetchPurchasesSummary: async (filters) => {
    try {
      set({ loading: true })
      const res = await getPurchasesSummary(filters)
      if (res.success) set({ purchasesSummary: res.data })
      else set({ error: res.message || "Error fetching purchases summary" })
    } finally {
      set({ loading: false })
    }
  },

  fetchTopProducts: async (limit = 10, filters) => {
    try {
      set({ loading: true })
      const res = await getTopProducts(limit, filters)
      if (res.success) set({ topProducts: res.data || [] })
      else set({ error: res.message || "Error fetching top products" })
    } finally {
      set({ loading: false })
    }
  },

  fetchTopCategories: async (limit = 10, filters) => {
    try {
      set({ loading: true })
      const res = await getTopCategories(limit, filters)
      if (res.success) set({ topCategories: res.data || [] })
      else set({ error: res.message || "Error fetching top categories" })
    } finally {
      set({ loading: false })
    }
  },

  fetchLowStockProducts: async (limit = 10) => {
    try {
      set({ loading: true })
      const res = await getLowStockProducts(limit)
      if (res.success) set({ lowStockProducts: res.data || [] })
      else set({ error: res.message || "Error fetching low stock products" })
    } finally {
      set({ loading: false })
    }
  },

  fetchFinancialSummary: async (filters) => {
    try {
      set({ loading: true })
      const res = await getFinancialSummary(filters)
      if (res.success) set({ financialSummary: res.data })
      else set({ error: res.message || "Error fetching financial summary" })
    } finally {
      set({ loading: false })
    }
  },

  fetchSalesByPeriod: async (period = 'day', limit = 30) => {
    try {
      set({ loading: true })
      const res = await getSalesByPeriod(period, limit)
      if (res.success) set({ salesByPeriod: res.data || [] })
      else set({ error: res.message || "Error fetching sales by period" })
    } finally {
      set({ loading: false })
    }
  }
}))

