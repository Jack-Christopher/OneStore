export interface CreateTenantDTO {
  name: string;
  legal_name?: string;
  document_type?: string;
  document_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  metadata?: object;
}

export interface CreateManagerDTO {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  tenant_id: string;
}

export interface UpdateTenantStatusDTO {
  is_active: boolean;
}

