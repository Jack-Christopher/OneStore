import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface Clerk {
  _id: string;
  tenant_id: string;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CreateClerkPayload {
  email: string;
  password: string;
  full_name?: string;
}

export interface UpdateClerkPayload {
  email?: string;
  full_name?: string;
  is_active?: boolean;
}

const MANAGER_API_BASE = "/api/manager";

export const getClerks = async () => {
  const res = await api.get<ApiResponse<Clerk[]>>(`${MANAGER_API_BASE}/users`);
  return res.data;
};

export const createClerk = async (payload: CreateClerkPayload) => {
  const res = await api.post<ApiResponse<Clerk>>(`${MANAGER_API_BASE}/users`, payload);
  return res.data;
};

export const updateClerk = async (id: string, payload: UpdateClerkPayload) => {
  const res = await api.put<ApiResponse<Clerk>>(`${MANAGER_API_BASE}/users/${id}`, payload);
  return res.data;
};

export const deleteClerk = async (id: string) => {
  const res = await api.delete<ApiResponse<null>>(`${MANAGER_API_BASE}/users/${id}`);
  return res.data;
};

