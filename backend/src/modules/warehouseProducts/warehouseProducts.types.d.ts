export interface WarehouseProductDTO {
  tenantId: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  reserved: number;
  available: number;
}

export interface WarehouseProductEntity {
  id: string;
  tenantId: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  reserved: number;
  available: number;
}

export interface WarehouseProductUpdateDTO {
  tenantId?: string;
  warehouseId?: string;
  productId?: string;
  quantity?: number;
  reserved?: number;
  available?: number;
}

