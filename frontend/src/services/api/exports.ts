import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export type ExportFormat = 'csv' | 'json';

export type ExportableModule = 
  | 'sales'
  | 'products'
  | 'categories'
  | 'customers'
  | 'suppliers'
  | 'warehouses'
  | 'purchaseOrders'
  | 'stockMovements'
  | 'warehouseProducts'
  | 'unitsOfMeasure'
  | 'productFormulas'
  | 'saleItems';

export type ImportFormat = ExportFormat;
export type ImportableModule = ExportableModule;

export interface AvailableModule {
  name: ExportableModule;
  label: string;
}

const EXPORTS_API_BASE = "/api/exports";

/**
 * Get list of available modules for export
 */
export const getAvailableModules = async () => {
  const res = await api.get<ApiResponse<AvailableModule[]>>(`${EXPORTS_API_BASE}/modules`);
  return res.data;
};

/**
 * Export data for a specific module in the requested format
 * This will trigger a file download
 */
export const exportModule = async (module: ExportableModule, format: ExportFormat) => {
  try {
    const response = await api.get(`${EXPORTS_API_BASE}/${module}/${format}`, {
      responseType: 'blob',
    });

    // Get filename from Content-Disposition header or generate one
    const contentDisposition = response.headers['content-disposition'];
    let filename = `${module}_export_${new Date().toISOString().split('T')[0]}.${format}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Create blob URL and trigger download
    const blob = new Blob([response.data], {
      type: format === 'csv' ? 'text/csv' : 'application/json',
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error: any) {
    console.error('Export error:', error);
    throw error;
  }
};

