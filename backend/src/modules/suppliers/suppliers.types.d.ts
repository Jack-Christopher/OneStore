export interface SupplierDTO {
  tenantId: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  metadata?: any;
}

export interface SupplierEntity {
  id: string;
  tenantId: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  metadata?: any;
}

export interface SupplierUpdateDTO {
  tenantId?: string;
  name?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  metadata?: any;
}

