import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface KardexRow {
  _id: string;
  created_at: string;
  movement_type: string;
  quantity: number;
  unit_cost_base?: number | null;
  balance: number;
  comment?: string;
  warehouse_id?: string;
}

export const getKardex = async (productId: string) => {
  const res = await api.get<ApiResponse<KardexRow[]>>(`/api/stockMovements/kardex/${productId}`);
  return res.data;
};
