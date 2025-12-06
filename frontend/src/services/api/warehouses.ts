import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface Warehouse {
  _id: string;
  tenantId: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  metadata?: any;
}

export interface CreateWarehousePayload {
  tenantId: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export interface UpdateWarehousePayload {
  tenantId?: string;
  name?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

const WAREHOUSE_API_BASE = "/api/warehouses";

export const getWarehouses = async () => {
  const res = await api.get<ApiResponse<Warehouse[]>>(WAREHOUSE_API_BASE)
  return res.data
}

export const getWarehouse = async (id: string) => {
  const res = await api.get<ApiResponse<Warehouse>>(`${WAREHOUSE_API_BASE}/${id}`)
  return res.data
}

export const createWarehouse = async (payload: CreateWarehousePayload) => {
  const res = await api.post<ApiResponse<Warehouse>>(WAREHOUSE_API_BASE, payload)
  return res.data
}

export const updateWarehouse = async (id: string, payload: UpdateWarehousePayload) => {
  const res = await api.put<ApiResponse<Warehouse>>(`${WAREHOUSE_API_BASE}/${id}`, payload)
  return res.data
}

export const deleteWarehouse = async (id: string) => {
  const res = await api.delete<ApiResponse<null>>(`${WAREHOUSE_API_BASE}/${id}`)
  return res.data
}

