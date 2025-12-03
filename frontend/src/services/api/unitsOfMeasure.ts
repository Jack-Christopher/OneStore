import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface UnitOfMeasure {
  _id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string;
}

export interface CreateUnitOfMeasurePayload {
  tenantId: string;
  name: string
  code: string
  description: string;
}

export interface UpdateUnitOfMeasurePayload {
  tenantId: string;
  name?: string
  code?: string
  description?: string
}

// CRUD Operations

const UNIT_OF_MEASURE_API_BASE = "/api/unitsOfMeasure";


export const getUnitsOfMeasure = async () => {
  const res = await api.get<ApiResponse<UnitOfMeasure[]>>(UNIT_OF_MEASURE_API_BASE)
  return res.data
}

export const getUnitOfMeasure = async (id: string) => {
  const res = await api.get<ApiResponse<UnitOfMeasure>>(`${UNIT_OF_MEASURE_API_BASE}/${id}`)
  return res.data
}

export const createUnitOfMeasure = async (payload: CreateUnitOfMeasurePayload) => {
  const res = await api.post<ApiResponse<UnitOfMeasure>>(UNIT_OF_MEASURE_API_BASE, payload)
  return res.data
}

export const updateUnitOfMeasure = async (id: string, payload: UpdateUnitOfMeasurePayload) => {
  const res = await api.put<ApiResponse<UnitOfMeasure>>(`${UNIT_OF_MEASURE_API_BASE}/${id}`, payload)
  return res.data
}

export const deleteUnitOfMeasure = async (id: string) => {
  const res = await api.delete<ApiResponse<null>>(`${UNIT_OF_MEASURE_API_BASE}/${id}`)
  return res.data
}