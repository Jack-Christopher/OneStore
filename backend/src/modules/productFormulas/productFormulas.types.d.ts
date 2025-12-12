export interface ProductFormulaDTO {
  tenantId: string;
  name: string;
  description: string;
  items: {
    productId: string;
    unitId: string;
    quantity: number;
  }[];
  referenceQuantity: number;
  referenceUnitId: string;
}

export interface ProductFormulaEntity {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  items: {
    productId: string;
    unitId: string;
    quantity: number;
  }[];
  referenceQuantity: number;
  referenceUnitId: string;
}

export interface ProductFormulaUpdateDTO {
  tenantId?: string;
  name?: string;
  description?: string;
  items?: {
    productId: string;
    unitId: string;
    quantity: number;
  }[];
  referenceQuantity?: number;
  referenceUnitId?: string;
}
