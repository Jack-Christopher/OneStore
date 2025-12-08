import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";
import type { ImportFormat, ImportableModule } from "./exports";

export interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const IMPORTS_API_BASE = "/api/imports";

/**
 * Import data for a specific module in the requested format
 */
export const importModule = async (
  module: ImportableModule,
  format: ImportFormat,
  file: File
): Promise<ApiResponse<ImportResult>> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post<ApiResponse<ImportResult>>(
    `${IMPORTS_API_BASE}/${module}/${format}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return res.data;
};

