import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export type BillingDocumentType = 'invoice' | 'sale_ticket' | 'credit_note' | 'debit_note' | 'sale_note' | 'proforma';

// Mapeo de tipos de documento a rutas
const documentTypeRouteMap: Record<BillingDocumentType, string> = {
  invoice: 'invoices',
  sale_ticket: 'sale-tickets',
  credit_note: 'credit-notes',
  debit_note: 'debit-notes',
  sale_note: 'sale-notes',
  proforma: 'proformas',
};

// Base document interface
export interface BillingDocument {
  _id: string;
  tenant_id: string;
  serie: string;
  numero: string;
  sucursal?: string;
  cliente_doc?: string;
  cliente_nombre?: string;
  fecha_emision?: string;
  fecha_vencimiento?: string;
  fecha_creacion?: string;
  usuario?: string;
  placa_vehiculo?: string;
  observaciones?: string;
  otros?: string;
  moneda?: string;
  rc?: number;
  descuento?: number;
  gravado?: number;
  exonerado?: number;
  inafecto?: number;
  exportacion?: number;
  gratuito?: number;
  igv?: number;
  isc?: number;
  icbper?: number;
  total: number;
  anulado?: string;
  // Campos específicos de Invoice/SaleTicket
  orden_compra?: string;
  guias_remision?: string;
  cond_pago?: string;
  met_pago?: string;
  referencia?: string;
  cuotas?: string;
  detraccion_pen?: number;
  retencion?: number;
  percepcion_pen?: number;
  estado_sunat?: string;
  // Campos específicos de CreditNote/DebitNote
  documento_afectado?: string;
  motivo?: string;
}

const BILLING_API_BASE = "/api/billing";

/**
 * Obtiene la ruta para un tipo de documento
 */
function getDocumentRoute(documentType: BillingDocumentType): string {
  return `${BILLING_API_BASE}/${documentTypeRouteMap[documentType]}`;
}

/**
 * Lista todos los documentos de un tipo específico
 */
export const getBillingDocuments = async (documentType: BillingDocumentType) => {
  const route = getDocumentRoute(documentType);
  const res = await api.get<ApiResponse<BillingDocument[]>>(route);
  return res.data;
};

/**
 * Obtiene un documento por ID
 */
export const getBillingDocument = async (documentType: BillingDocumentType, id: string) => {
  const route = getDocumentRoute(documentType);
  const res = await api.get<ApiResponse<BillingDocument>>(`${route}/${id}`);
  return res.data;
};

/**
 * Importa documentos desde Keyfacil
 */
export const importFromKeyfacil = async (
  file: File,
  documentType?: BillingDocumentType | 'auto'
) => {
  const formData = new FormData();
  formData.append('file', file);
  if (documentType && documentType !== 'auto') {
    formData.append('documentType', documentType);
  }
  
  const res = await api.post<ApiResponse<{
    success: number;
    failed: number;
    errors: string[];
  }>>(`${BILLING_API_BASE}/import/keyfacil`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

