import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

// TODO: Add the created_by and updated_by fields
// TODO: Add support for camelCase to snakeCase conversion

export interface Category {
  _id: string;
  tenantId: string;
  name: string;
  description: string;
}

export interface CreateCategoryPayload {
  tenantId: string;
  name: string
  description: string;
}

export interface UpdateCategoryPayload {
  tenantId: string;
  name?: string
  description?: string
}

// CRUD Operations

const CATEGORY_API_BASE = "/api/categories";


export const getCategories = async () => {
  const res = await api.get<ApiResponse<Category[]>>(CATEGORY_API_BASE)
  return res.data
}

export const getCategory = async (id: string) => {
  const res = await api.get<ApiResponse<Category>>(`${CATEGORY_API_BASE}/${id}`)
  return res.data
}

export const createCategory = async (payload: CreateCategoryPayload) => {
  const res = await api.post<ApiResponse<Category>>(CATEGORY_API_BASE, payload)
  return res.data
}

export const updateCategory = async (id: string, payload: UpdateCategoryPayload) => {
  const res = await api.put<ApiResponse<Category>>(`${CATEGORY_API_BASE}/${id}`, payload)
  return res.data
}

export const deleteCategory = async (id: string) => {
  const res = await api.delete<ApiResponse<null>>(`${CATEGORY_API_BASE}/${id}`)
  return res.data
}