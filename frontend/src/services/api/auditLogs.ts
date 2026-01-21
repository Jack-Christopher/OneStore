import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface AuditLog {
  _id: string;
  tenant_id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id?: string;
  old_data?: any;
  new_data?: any;
  performed_at: string;
}

export interface AuditLogFilters {
  tenant_id?: string;
  user_id?: string;
  entity?: string;
  action?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const AUDIT_LOGS_API_BASE = "/api/audit-logs";

export const getAuditLogs = async (filters?: AuditLogFilters) => {
  const params = new URLSearchParams();
  
  if (filters?.tenant_id) params.append("tenant_id", filters.tenant_id);
  if (filters?.user_id) params.append("user_id", filters.user_id);
  if (filters?.entity) params.append("entity", filters.entity);
  if (filters?.action) params.append("action", filters.action);
  if (filters?.date_from) params.append("date_from", filters.date_from);
  if (filters?.date_to) params.append("date_to", filters.date_to);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  const queryString = params.toString();
  const url = queryString ? `${AUDIT_LOGS_API_BASE}?${queryString}` : AUDIT_LOGS_API_BASE;
  
  const res = await api.get<ApiResponse<AuditLogsResponse>>(url);
  return res.data;
};

export const getAuditLog = async (id: string) => {
  const res = await api.get<ApiResponse<AuditLog>>(`${AUDIT_LOGS_API_BASE}/${id}`);
  return res.data;
};

export interface AllowedUser {
  _id: string;
  email: string;
  full_name?: string;
  role: string;
  tenant_id: string;
}

export const getAllowedUsers = async () => {
  const res = await api.get<ApiResponse<AllowedUser[]>>(`${AUDIT_LOGS_API_BASE}/allowed-users`);
  return res.data;
};

