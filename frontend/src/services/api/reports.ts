import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface SalesSummary {
  totalSales: number;
  totalAmount: number;
  averageAmount: number;
}

export interface PurchasesSummary {
  totalOrders: number;
  pendingOrders: number;
  receivedOrders: number;
  canceledOrders: number;
  totalAmount: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  salesCount: number;
  purchasesCount: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalAmount: number;
}

export interface TopCategory {
  categoryId: string;
  categoryName: string;
  totalQuantity: number;
  totalAmount: number;
}

export interface LowStockProduct {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
}

export interface DashboardStats {
  salesSummary: SalesSummary;
  purchasesSummary: PurchasesSummary;
  financialSummary: FinancialSummary;
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  lowStockProducts: LowStockProduct[];
}

export interface SalesByPeriod {
  _id: string;
  totalSales: number;
  totalAmount: number;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  warehouseId?: string;
  categoryId?: string;
}

const REPORTS_API_BASE = "/api/reports";

export const getDashboardStats = async (filters?: ReportFilters) => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const res = await api.get<ApiResponse<DashboardStats>>(`${REPORTS_API_BASE}/dashboard?${params}`)
  return res.data
}

export const getSalesSummary = async (filters?: ReportFilters) => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const res = await api.get<ApiResponse<SalesSummary>>(`${REPORTS_API_BASE}/sales-summary?${params}`)
  return res.data
}

export const getPurchasesSummary = async (filters?: ReportFilters) => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const res = await api.get<ApiResponse<PurchasesSummary>>(`${REPORTS_API_BASE}/purchases-summary?${params}`)
  return res.data
}

export const getTopProducts = async (limit: number = 10, filters?: ReportFilters) => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const res = await api.get<ApiResponse<TopProduct[]>>(`${REPORTS_API_BASE}/top-products?${params}`)
  return res.data
}

export const getTopCategories = async (limit: number = 10, filters?: ReportFilters) => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const res = await api.get<ApiResponse<TopCategory[]>>(`${REPORTS_API_BASE}/top-categories?${params}`)
  return res.data
}

export const getLowStockProducts = async (limit: number = 10) => {
  const params = new URLSearchParams();
  params.append('limit', limit.toString());

  const res = await api.get<ApiResponse<LowStockProduct[]>>(`${REPORTS_API_BASE}/low-stock?${params}`)
  return res.data
}

export const getFinancialSummary = async (filters?: ReportFilters) => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const res = await api.get<ApiResponse<FinancialSummary>>(`${REPORTS_API_BASE}/financial-summary?${params}`)
  return res.data
}

export const getSalesByPeriod = async (period: 'day' | 'week' | 'month' = 'day', limit: number = 30) => {
  const params = new URLSearchParams();
  params.append('period', period);
  params.append('limit', limit.toString());

  const res = await api.get<ApiResponse<SalesByPeriod[]>>(`${REPORTS_API_BASE}/sales-by-period?${params}`)
  return res.data
}

