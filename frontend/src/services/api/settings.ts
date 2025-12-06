import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface Settings {
  store_name?: string;
  store_ruc?: string;
  store_logo_path?: string;
  date_format?: string;
  theme?: string;
  currency?: string;
}

export interface UpdateSettingsPayload {
  store_name?: string;
  store_ruc?: string;
  store_logo_path?: string;
  date_format?: string;
  theme?: string;
  currency?: string;
}

const SETTINGS_API_BASE = "/api/settings";

export const getSettings = async () => {
  const res = await api.get<ApiResponse<Settings>>(SETTINGS_API_BASE);
  return res.data;
};

export const updateSettings = async (payload: UpdateSettingsPayload) => {
  const res = await api.put<ApiResponse<Settings>>(SETTINGS_API_BASE, payload);
  return res.data;
};

export const uploadLogo = async (file: File) => {
  const formData = new FormData();
  formData.append("logo", file);
  const res = await api.post<ApiResponse<{ path: string }>>(
    `${SETTINGS_API_BASE}/uploadLogo`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};

