export type BillingDocumentType = 'invoice' | 'sale_ticket' | 'credit_note' | 'debit_note' | 'sale_note' | 'proforma';

export interface BaseBillingDocument {
  tenantId: string;
  serie: string;
  numero: string;
  sucursal?: string;
  clienteDoc?: string;
  clienteNombre?: string;
  fechaEmision?: Date | string;
  fechaVencimiento?: Date | string;
  fechaCreacion?: Date | string;
  usuario?: string;
  placaVehiculo?: string;
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
}

export interface InvoiceDTO extends BaseBillingDocument {
  ordenCompra?: string;
  guiasRemision?: string;
  condPago?: string;
  metPago?: string;
  referencia?: string;
  cuotas?: string;
  detraccionPen?: number;
  retencion?: number;
  percepcionPen?: number;
  estadoSunat?: string;
}

export interface SaleTicketDTO extends BaseBillingDocument {
  ordenCompra?: string;
  guiasRemision?: string;
  condPago?: string;
  metPago?: string;
  referencia?: string;
  cuotas?: string;
  detraccionPen?: number;
  retencion?: number;
  percepcionPen?: number;
  estadoSunat?: string;
}

export interface CreditNoteDTO extends BaseBillingDocument {
  documentoAfectado?: string;
  motivo?: string;
  estadoSunat?: string;
}

export interface DebitNoteDTO extends BaseBillingDocument {
  documentoAfectado?: string;
  motivo?: string;
  estadoSunat?: string;
}

export interface SaleNoteDTO extends BaseBillingDocument {
  ordenCompra?: string;
  guiasRemision?: string;
  condPago?: string;
  metPago?: string;
  referencia?: string;
  cuotas?: string;
}

export interface ProformaDTO extends BaseBillingDocument {
  ordenCompra?: string;
  guiasRemision?: string;
  condPago?: string;
  metPago?: string;
  referencia?: string;
  cuotas?: string;
}

export interface BillingDocumentItemDTO {
  tenantId: string;
  documentType: BillingDocumentType;
  documentId: string;
  productoNombre?: string;
  productoCodigo?: string;
  cantidad?: number;
  precioUnitario?: number;
  descuento?: number;
  gravado?: number;
  exonerado?: number;
  inafecto?: number;
  exportacion?: number;
  gratuito?: number;
  igv?: number;
  isc?: number;
  icbper?: number;
  totalLinea?: number;
}

