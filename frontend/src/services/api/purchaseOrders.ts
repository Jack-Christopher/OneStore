import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface PurchaseOrder {
  _id: string;
  tenantId: string;
  supplierId: string;
  warehouseId: string;
  userId: string;
  status: 'pending' | 'received' | 'canceled';
  referenceNumber: string;
  totalAmount: number;
  notes: string;
  metadata?: any;
}

export interface PurchaseOrderItem {
  _id: string;
  tenantId: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  receivedQuantity: number;
}

export interface CreatePurchaseOrderPayload {
  tenantId: string;
  supplierId: string;
  warehouseId: string;
  userId: string;
  status: 'pending' | 'received' | 'canceled';
  referenceNumber: string;
  totalAmount: number;
  notes: string;
}

export interface CreatePurchaseOrderItemPayload {
  tenantId: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CreatePurchaseOrderWithItemsPayload {
  order: CreatePurchaseOrderPayload;
  items: Omit<CreatePurchaseOrderItemPayload, 'purchaseOrderId'>[];
}

export interface UpdatePurchaseOrderPayload {
  tenantId?: string;
  supplierId?: string;
  warehouseId?: string;
  userId?: string;
  status?: 'pending' | 'received' | 'canceled';
  referenceNumber?: string;
  totalAmount?: number;
  notes?: string;
}

const PURCHASE_ORDER_API_BASE = "/api/purchaseOrders";

export const getPurchaseOrders = async () => {
  const res = await api.get<ApiResponse<PurchaseOrder[]>>(PURCHASE_ORDER_API_BASE)
  return res.data
}

export const getPurchaseOrder = async (id: string) => {
  const res = await api.get<ApiResponse<PurchaseOrder>>(`${PURCHASE_ORDER_API_BASE}/${id}`)
  return res.data
}

export const createPurchaseOrder = async (payload: CreatePurchaseOrderPayload) => {
  const res = await api.post<ApiResponse<PurchaseOrder>>(PURCHASE_ORDER_API_BASE, payload)
  return res.data
}

export const createPurchaseOrderWithItems = async (payload: CreatePurchaseOrderWithItemsPayload) => {
  const res = await api.post<ApiResponse<PurchaseOrder>>(`${PURCHASE_ORDER_API_BASE}/with-items`, payload)
  return res.data
}

export const updatePurchaseOrder = async (id: string, payload: UpdatePurchaseOrderPayload) => {
  const res = await api.put<ApiResponse<PurchaseOrder>>(`${PURCHASE_ORDER_API_BASE}/${id}`, payload)
  return res.data
}

export const deletePurchaseOrder = async (id: string) => {
  const res = await api.delete<ApiResponse<null>>(`${PURCHASE_ORDER_API_BASE}/${id}`)
  return res.data
}

export const receivePurchaseOrder = async (id: string) => {
  const res = await api.post<ApiResponse<PurchaseOrder>>(`${PURCHASE_ORDER_API_BASE}/${id}/receive`)
  return res.data
}

export const getPurchaseOrderItems = async (orderId: string) => {
  const res = await api.get<ApiResponse<PurchaseOrderItem[]>>(`${PURCHASE_ORDER_API_BASE}/${orderId}/items`)
  return res.data
}

