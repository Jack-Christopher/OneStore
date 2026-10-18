import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface RucRecord {
  ruc: string;
  name: string;
  status?: string | null;
  condition?: string | null;
  address?: string | null;
  source: string;
}

export const lookupRuc = async (ruc: string) => {
  const res = await api.get<ApiResponse<RucRecord>>(`/api/ruc/${ruc}`);
  return res.data;
};

export function rucErrorMessage(error: { userMessage?: string; message?: string } | null | undefined) {
  const raw = String(error?.userMessage || error?.message || "");
  if (/enotfound|getaddrinfo|econn|etimedout|decolecta|openruc|apis\.net/i.test(raw)) {
    return "No se pudo consultar el RUC. El servicio de consulta no está disponible en este momento.";
  }
  if (/11 dígitos/i.test(raw)) return "El RUC debe tener 11 dígitos.";
  if (/no encontramos una empresa/i.test(raw)) return raw;
  if (raw && !/error/i.test(raw)) return raw;
  return "No se pudo consultar el RUC. Revisa el número e inténtalo de nuevo.";
}
