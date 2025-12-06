export type MovementType = 'purchase' | 'sale' | 'adjustment_in' | 'adjustment_out' | 'transfer_in' | 'transfer_out';

export interface StockMovementDTO {
  tenantId: string;
  warehouseId: string;
  productId: string;
  movementType: MovementType;
  quantity: number;
  relatedId?: string;
  comment?: string;
  metadata?: any;
  createdBy?: string;
}

export interface StockMovementEntity {
  id: string;
  tenantId: string;
  warehouseId: string;
  productId: string;
  movementType: MovementType;
  quantity: number;
  relatedId?: string;
  comment?: string;
  metadata?: any;
  createdBy?: string;
}

export interface StockMovementUpdateDTO {
  tenantId?: string;
  warehouseId?: string;
  productId?: string;
  movementType?: MovementType;
  quantity?: number;
  relatedId?: string;
  comment?: string;
  metadata?: any;
  createdBy?: string;
}

