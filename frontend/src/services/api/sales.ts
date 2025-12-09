import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface Sale {
  _id: string;
  tenantId: string;
  warehouseId: string,
  userId: string,
  customerName: string,
  customerDocument: string,
  status: string,
  paymentMethod: string,
  totalAmount: number,
  notes: string,
}

export interface CreateSalePayload {
  tenantId: string;
  warehouseId: string,
  userId: string,
  customerName: string,
  customerDocument: string,
  status: string,
  paymentMethod: string,
  totalAmount: number,
  notes: string,
  useForeignCurrency?: boolean;
  currencyCode?: string;
  exchangeRate?: number;
  totalOriginal?: number;
}

export interface UpdateSalePayload {
  tenantId?: string;
  warehouseId?: string,
  userId?: string,
  customerName?: string,
  customerDocument?: string,
  status?: string,
  paymentMethod?: string,
  totalAmount?: number,
  notes?: string,
}

// CRUD Operations

const SALE_API_BASE = "/api/sales";


export const getSales = async () => {
  const res = await api.get<ApiResponse<Sale[]>>(SALE_API_BASE)
  return res.data
}

export const getSale = async (id: string) => {
  const res = await api.get<ApiResponse<Sale>>(`${SALE_API_BASE}/${id}`)
  return res.data
}

export const createSale = async (payload: CreateSalePayload) => {
  const res = await api.post<ApiResponse<Sale>>(SALE_API_BASE, payload)
  return res.data
}

export interface CreateSaleWithItemsPayload {
  sale: CreateSalePayload;
  items: Array<{
    tenantId: string;
    productId: string;
    unitId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
}

export const createSaleWithItems = async (payload: CreateSaleWithItemsPayload) => {
  const res = await api.post<ApiResponse<Sale>>(`${SALE_API_BASE}/with-items`, payload)
  return res.data
}

export const updateSale = async (id: string, payload: UpdateSalePayload) => {
  const res = await api.put<ApiResponse<Sale>>(`${SALE_API_BASE}/${id}`, payload)
  return res.data
}

export const deleteSale = async (id: string) => {
  const res = await api.delete<ApiResponse<null>>(`${SALE_API_BASE}/${id}`)
  return res.data
}