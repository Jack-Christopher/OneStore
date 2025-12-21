export interface ProductDTO {
  categoryId: String,
  unitId: String,
  sku: String,
  purchasePrice: Number,
  salePrice: Number,
  minStock: Number,
  maxStock: Number,
  subUnitsPerUnit: Number,
  isActive: Boolean,
  tenantId: string;
  name: string;
  description: string;
}

export interface ProductEntity {
  id: string;
  tenantId: string;
  categoryId: String,
  unitId: String,
  sku: String,
  purchasePrice: Number,
  salePrice: Number,
  minStock: Number,
  maxStock: Number,
  subUnitsPerUnit: Number,
  isActive: Boolean,
  tenantId: string;
  name: string;
  description: string;
}

export interface ProductUpdateDTO {
  tenantId?: string;
  categoryId?: String,
  unitId?: String,
  sku?: String,
  purchasePrice?: Number,
  salePrice?: Number,
  minStock?: Number,
  maxStock?: Number,
  subUnitsPerUnit?: Number,
  isActive?: Boolean,
  name?: string;
  description?: string;
}
