import { create } from "zustand";
import { getAuditLogs, getAuditLog, type AuditLog, type AuditLogFilters, type AuditLogsResponse } from "@/services/api/auditLogs";

interface AuditLogsState {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  fetch: (filters?: AuditLogFilters) => Promise<void>;
  getOne: (id: string) => Promise<AuditLog | null>;
}

export const useAuditLogsStore = create<AuditLogsState>((set, get) => ({
  logs: [],
  total: 0,
  page: 1,
  limit: 50,
  totalPages: 0,
  loading: false,
  error: null,

  fetch: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getAuditLogs(filters);
      if (res.success && res.data) {
        set({
          logs: res.data.logs,
          total: res.data.total,
          page: res.data.page,
          limit: res.data.limit,
          totalPages: res.data.totalPages,
        });
      } else {
        set({ error: res.message || "Error fetching audit logs" });
      }
    } catch (error: any) {
      set({ error: error?.response?.data?.message || "Error fetching audit logs" });
    } finally {
      set({ loading: false });
    }
  },

  getOne: async (id) => {
    try {
      const res = await getAuditLog(id);
      if (res.success && res.data) {
        return res.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching audit log:", error);
      return null;
    }
  },
}));

