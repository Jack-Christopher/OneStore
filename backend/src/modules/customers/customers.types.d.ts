export interface CustomerDTO {
  tenantId: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  metadata?: any;
}

export interface CustomerEntity {
  id: string;
  tenantId: string;
  name: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  metadata?: any;
}

export interface CustomerUpdateDTO {
  tenantId?: string;
  name?: string;
  document?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
  metadata?: any;
}

