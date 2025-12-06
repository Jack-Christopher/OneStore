export interface PurchaseOrderDTO {
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

export interface PurchaseOrderEntity {
  id: string;
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

export interface PurchaseOrderUpdateDTO {
  tenantId?: string;
  supplierId?: string;
  warehouseId?: string;
  userId?: string;
  status?: 'pending' | 'received' | 'canceled';
  referenceNumber?: string;
  totalAmount?: number;
  notes?: string;
  metadata?: any;
}

export interface PurchaseOrderItemDTO {
  tenantId: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  receivedQuantity: number;
}

export interface PurchaseOrderItemEntity {
  id: string;
  tenantId: string;
  purchaseOrderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  receivedQuantity: number;
}

export interface PurchaseOrderItemUpdateDTO {
  tenantId?: string;
  purchaseOrderId?: string;
  productId?: string;
  quantity?: number;
  unitPrice?: number;
  subtotal?: number;
  receivedQuantity?: number;
}

export interface CreatePurchaseOrderWithItemsDTO {
  order: PurchaseOrderDTO;
  items: PurchaseOrderItemDTO[];
}

