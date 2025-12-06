export interface WarehouseDTO {
  tenantId: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  metadata?: any;
}

export interface WarehouseEntity {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  metadata?: any;
}

export interface WarehouseUpdateDTO {
  tenantId?: string;
  name?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
  metadata?: any;
}

