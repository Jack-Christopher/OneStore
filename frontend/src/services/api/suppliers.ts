import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface Supplier {
  _id: string;
  tenantId: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  metadata?: any;
}

export interface CreateSupplierPayload {
  tenantId: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
}

export interface UpdateSupplierPayload {
  tenantId?: string;
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

const SUPPLIER_API_BASE = "/api/suppliers";

export const getSuppliers = async () => {
  const res = await api.get<ApiResponse<Supplier[]>>(SUPPLIER_API_BASE)
  return res.data
}

export const getSupplier = async (id: string) => {
  const res = await api.get<ApiResponse<Supplier>>(`${SUPPLIER_API_BASE}/${id}`)
  return res.data
}

export const createSupplier = async (payload: CreateSupplierPayload) => {
  const res = await api.post<ApiResponse<Supplier>>(SUPPLIER_API_BASE, payload)
  return res.data
}

export const updateSupplier = async (id: string, payload: UpdateSupplierPayload) => {
  const res = await api.put<ApiResponse<Supplier>>(`${SUPPLIER_API_BASE}/${id}`, payload)
  return res.data
}

export const deleteSupplier = async (id: string) => {
  const res = await api.delete<ApiResponse<null>>(`${SUPPLIER_API_BASE}/${id}`)
  return res.data
}

