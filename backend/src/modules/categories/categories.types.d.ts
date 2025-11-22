export interface CategoryDTO {
  tenantId: string;
  name: string;
  description: string;
}

export interface CategoryEntity {
  id: string;
  tenantId: string;
  name: string;
  description: string;
}

export interface CategoryUpdateDTO {
  tenantId?: string;
  name?: string;
  description?: string;
}
