import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface Product {
  _id: string;
  tenantId: string;
  categoryId?: string & { name: string };
  unitId?: string & { name: string };
  supplierId?: string & { name: string };
  name: string;
  sku?: string;
  barcode?: string;
  purchasePrice?: number;
  salePrice?: number;
  minStock?: number;
  maxStock?: number;
  subUnitsPerUnit?: number;
  productType?: "input" | "finished" | "resale";
  product_type?: "input" | "finished" | "resale";
  purchaseUnitId?: string;
  purchase_unit_id?: string & { _id?: string; name?: string };
  purchaseToStockFactor?: number;
  purchase_to_stock_factor?: number;
  marginPercent?: number;
  margin_percent?: number;
  price_stale?: boolean;
  description?: string;
  currentStock?: number;
}

export interface MostSoldProduct extends Product {
  totalQuantity: number;
}

export interface CreateProductPayload {
  tenantId: string;
  categoryId?: string;
  unitId?: string;
  supplierId: string;
  name: string;
  sku?: string;
  barcode?: string;
  purchasePrice?: number;
  salePrice?: number;
  minStock?: number;
  maxStock?: number;
  subUnitsPerUnit?: number;
  productType?: "input" | "finished" | "resale";
  purchaseUnitId?: string;
  purchaseToStockFactor?: number;
  marginPercent?: number;
  description?: string;
}

export interface UpdateProductPayload {
  _id?: string;
  tenantId?: string;
  categoryId?: string;
  unitId?: string;
  supplierId?: string;
  name?: string;
  sku?: string;
  barcode?: string;
  purchasePrice?: number;
  salePrice?: number;
  minStock?: number;
  maxStock?: number;
  subUnitsPerUnit?: number;
  productType?: "input" | "finished" | "resale";
  purchaseUnitId?: string;
  purchaseToStockFactor?: number;
  marginPercent?: number;
  description?: string;
}

// CRUD Operations

const PRODUCT_API_BASE = "/api/products";


export const getProducts = async () => {
  const res = await api.get<ApiResponse<Product[]>>(PRODUCT_API_BASE)
  return res.data
}

export const getMostSoldProducts = async () => {
  const res = await api.get<ApiResponse<MostSoldProduct[]>>(`${PRODUCT_API_BASE}/most-sold`)
  return res.data
}

export const getProduct = async (id: string) => {
  const res = await api.get<ApiResponse<Product>>(`${PRODUCT_API_BASE}/${id}`)
  return res.data
}

export const createProduct = async (payload: CreateProductPayload) => {
  const res = await api.post<ApiResponse<Product>>(PRODUCT_API_BASE, payload)
  return res.data
}

export const updateProduct = async (id: string, payload: UpdateProductPayload) => {
  const res = await api.put<ApiResponse<Product>>(`${PRODUCT_API_BASE}/${id}`, payload)
  return res.data
}

export const deleteProduct = async (id: string) => {
  const res = await api.delete<ApiResponse<null>>(`${PRODUCT_API_BASE}/${id}`)
  return res.data
}

export const getProductByBarcode = async (barcode: string) => {
  const res = await api.get<ApiResponse<Product>>(`${PRODUCT_API_BASE}/barcode/${encodeURIComponent(barcode)}`)
  return res.data
}

/**
 * Importa productos desde Keyfacil
 */
export const importFromKeyfacil = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post<ApiResponse<{
    success: number;
    failed: number;
    errors: string[];
  }>>(`${PRODUCT_API_BASE}/import/keyfacil`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

export interface AdjustProductStockPayload {
  desiredStock: number;
  warehouseId?: string;
  comment?: string;
  metadata?: any;
}

export interface AdjustProductStockResult {
  productId: string;
  warehouseId?: string;
  previousStock: number;
  desiredStock: number;
  delta: number;
  newCurrentStock: number;
}

export const adjustProductStock = async (id: string, payload: AdjustProductStockPayload) => {
  const res = await api.post<ApiResponse<AdjustProductStockResult>>(`${PRODUCT_API_BASE}/${id}/adjust-stock`, payload)
  return res.data
}

export const downloadCostSheet = async () => {
  const res = await api.get("/api/exports/cost-sheet/csv", { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = "costos.csv";
  link.click();
  URL.revokeObjectURL(url);
};