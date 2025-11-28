export interface SaleItemDTO {
  tenantId: string;
  saleId: string,
  productId: string,
  unitId: string,
  quantity: number,
  unitPrice: number,
  subtotal: number,
}

export interface SaleItemEntity {
  id: string;
  tenantId: string;
  saleId: string,
  productId: string,
  unitId: string,
  quantity: number,
  unitPrice: number,
  subtotal: number,
}

export interface SaleItemUpdateDTO {
  tenantId?: string;
  saleId?: string,
  productId?: string,
  unitId?: string,
  quantity?: number,
  unitPrice?: number,
  subtotal?: number,
}
