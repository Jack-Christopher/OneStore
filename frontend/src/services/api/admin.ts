import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface Tenant {
  _id: string;
  name: string;
  legal_name?: string;
  document_type?: string;
  document_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  metadata?: object;
}

export interface CreateTenantPayload {
  name: string;
  legal_name?: string;
  document_type?: string;
  document_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  metadata?: object;
}

export interface UpdateTenantStatusPayload {
  is_active: boolean;
}

export interface Manager {
  _id: string;
  tenant_id: string;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateManagerPayload {
  email: string;
  password: string;
  full_name?: string;
  tenant_id: string;
}

const ADMIN_API_BASE = "/api/admin";

export const getTenants = async () => {
  const res = await api.get<ApiResponse<Tenant[]>>(`${ADMIN_API_BASE}/tenants`);
  return res.data;
};

export const createTenant = async (payload: CreateTenantPayload) => {
  const res = await api.post<ApiResponse<Tenant>>(`${ADMIN_API_BASE}/tenants`, payload);
  return res.data;
};

export const updateTenantStatus = async (id: string, payload: UpdateTenantStatusPayload) => {
  const res = await api.put<ApiResponse<Tenant>>(`${ADMIN_API_BASE}/tenants/${id}/status`, payload);
  return res.data;
};

export const createManager = async (payload: CreateManagerPayload) => {
  const res = await api.post<ApiResponse<Manager>>(`${ADMIN_API_BASE}/users/manager`, payload);
  return res.data;
};

export const getManagers = async () => {
  const res = await api.get<ApiResponse<Manager[]>>(`${ADMIN_API_BASE}/users/managers`);
  return res.data;
};