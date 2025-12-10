import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface Customer {
  _id: string;
  tenantId: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  metadata?: any;
}

export interface CreateCustomerPayload {
  tenantId: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
}

export interface UpdateCustomerPayload {
  tenantId?: string;
  name?: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
}

const CUSTOMER_API_BASE = "/api/customers";

export const getCustomers = async () => {
  const res = await api.get<ApiResponse<Customer[]>>(CUSTOMER_API_BASE)
  return res.data
}

export const getCustomer = async (id: string) => {
  const res = await api.get<ApiResponse<Customer>>(`${CUSTOMER_API_BASE}/${id}`)
  return res.data
}

export const createCustomer = async (payload: CreateCustomerPayload) => {
  const res = await api.post<ApiResponse<Customer>>(CUSTOMER_API_BASE, payload)
  return res.data
}

export const updateCustomer = async (id: string, payload: UpdateCustomerPayload) => {
  const res = await api.put<ApiResponse<Customer>>(`${CUSTOMER_API_BASE}/${id}`, payload)
  return res.data
}

export const deleteCustomer = async (id: string) => {
  const res = await api.delete<ApiResponse<null>>(`${CUSTOMER_API_BASE}/${id}`)
  return res.data
}

