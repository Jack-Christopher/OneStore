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
  purchasePrice?: number;
  salePrice?: number;
  minStock?: number;
  maxStock?: number;
  subUnitsPerUnit?: number;
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
  purchasePrice?: number;
  salePrice?: number;
  minStock?: number;
  maxStock?: number;
  subUnitsPerUnit?: number;
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
  purchasePrice?: number;
  salePrice?: number;
  minStock?: number;
  maxStock?: number;
  subUnitsPerUnit?: number;
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