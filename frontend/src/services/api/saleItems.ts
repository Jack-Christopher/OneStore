import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface SaleItem {
  _id: string;
  tenantId: string;
  saleId: string,
  productId: string,
  unitId: string,
  quantity: number,
  unitPrice: number,
  subtotal: number,
}

export interface CreateSaleItemState {
  id: string,
  tenantId: string,
  saleId: string,
  productId: string,
  unitId: string,
  quantity: number,
  unitPrice: number,
  subtotal: number,
}

export interface CreateSaleItemPayload {
  tenantId: string;
  saleId: string,
  productId: string,
  unitId: string,
  quantity: number,
  unitPrice: number,
  subtotal: number,
}

export interface UpdateSaleItemPayload {
  tenantId?: string;
  saleId?: string,
  productId?: string,
  unitId?: string,
  quantity?: number,
  unitPrice?: number,
  subtotal?: number,
}

// CRUD Operations

const SALE_ITEM_API_BASE = "/api/saleItems";


export const getSaleItems = async () => {
  const res = await api.get<ApiResponse<SaleItem[]>>(SALE_ITEM_API_BASE)
  return res.data
}

export const getSaleItemsBySaleId = async (id: string) => {
  const res = await api.get<ApiResponse<SaleItem[]>>(`${SALE_ITEM_API_BASE}/sale/${id}`)
  return res.data
}

export const getSaleItem = async (id: string) => {
  const res = await api.get<ApiResponse<SaleItem>>(`${SALE_ITEM_API_BASE}/${id}`)
  return res.data
}

export const createSaleItem = async (payload: CreateSaleItemPayload) => {
  const res = await api.post<ApiResponse<SaleItem>>(SALE_ITEM_API_BASE, payload)
  return res.data
}

export const createManySaleItem = async (payload: CreateSaleItemPayload[]) => {
  const res = await api.post<ApiResponse<SaleItem>>(`${SALE_ITEM_API_BASE}/add-many`, payload)
  return res.data
}

export const updateSaleItem = async (id: string, payload: UpdateSaleItemPayload) => {
  const res = await api.put<ApiResponse<SaleItem>>(`${SALE_ITEM_API_BASE}/${id}`, payload)
  return res.data
}

export const deleteSaleItem = async (id: string) => {
  const res = await api.delete<ApiResponse<null>>(`${SALE_ITEM_API_BASE}/${id}`)
  return res.data
}