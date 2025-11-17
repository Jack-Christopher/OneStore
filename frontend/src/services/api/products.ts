import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface Product {
  _id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
}

export interface CreateProductPayload {
  name: string
  price: number
  stock: number
  category: string
}

export interface UpdateProductPayload {
  name?: string
  price?: number
  stock?: number
  category?: string
}

// CRUD Operations

const PRODUCT_API_BASE = "/api/products";


export const getProducts = async () => {
  const res = await api.get<ApiResponse<Product[]>>(PRODUCT_API_BASE)
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