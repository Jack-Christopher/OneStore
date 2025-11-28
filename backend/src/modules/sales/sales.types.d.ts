export interface SaleDTO {
  tenantId: string;
  warehouseId: string,
  userId: string,
  customerName: string,
  customerDocument: string,
  status: string,
  paymentMethod: string,
  totalAmount: number,
  notes: string,
}

export interface SaleEntity {
  id: string;
  tenantId: string;
  warehouseId: string,
  userId: string,
  customerName: string,
  customerDocument: string,
  status: string,
  paymentMethod: string,
  totalAmount: number,
  notes: string,
}

export interface SaleUpdateDTO {
  tenantId?: string;
  warehouseId?: string,
  userId?: string,
  customerName?: string,
  customerDocument?: string,
  status?: string,
  paymentMethod?: string,
  totalAmount?: number,
  notes?: string,
}
