export interface ProductFormulaDTO {
  tenantId: string;
  name: string;
  description: string;
  items: {
    productId: string;
    unitId: string;
    quantity: number;
  }[];
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
}
