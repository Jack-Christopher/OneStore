import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface ProductFormula {
  _id: string;
  tenantId: string;
  name: string;
  description: string;
  items: {
    productId: string;
    unitId: string;
    quantity: number;
  }[];
}

export interface CreateProductFormulaState {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  items: {
    productId: string;
    unitId: string;
    quantity: number;
  }[];
}


export interface CreateProductFormulaItem {
  id: string;
  productId: string;
  unitId: string;
  quantity: number;
}

export interface CreateProductFormulaPayload {
  tenantId: string;
  name: string;
  description: string;
  items: {
    productId: string;
    unitId: string;
    quantity: number;
  }[];
}

export interface UpdateProductFormulaPayload {
  tenantId: string;
  name?: string;
  description?: string;
  items?: {
    productId: string;
    unitId: string;
    quantity: number;
  }[];
}

// CRUD Operations

const PRODUCT_FORMULA_API_BASE = "/api/productFormulas";


export const getProductFormulas = async () => {
  const res = await api.get<ApiResponse<ProductFormula[]>>(PRODUCT_FORMULA_API_BASE)
  return res.data
}

export const getProductFormula = async (id: string) => {
  const res = await api.get<ApiResponse<ProductFormula>>(`${PRODUCT_FORMULA_API_BASE}/${id}`)
  return res.data
}

export const createProductFormula = async (payload: CreateProductFormulaPayload) => {
  const res = await api.post<ApiResponse<ProductFormula>>(PRODUCT_FORMULA_API_BASE, payload)
  return res.data
}

export const updateProductFormula = async (id: string, payload: UpdateProductFormulaPayload) => {
  const res = await api.put<ApiResponse<ProductFormula>>(`${PRODUCT_FORMULA_API_BASE}/${id}`, payload)
  return res.data
}

export const deleteProductFormula = async (id: string) => {
  const res = await api.delete<ApiResponse<null>>(`${PRODUCT_FORMULA_API_BASE}/${id}`)
  return res.data
}