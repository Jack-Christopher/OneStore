export interface UnitOfMeasureDTO {
  tenantId: string;
  code: string;
  name: string;
  description: string;
}

export interface UnitOfMeasureEntity {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  description: string;
}

export interface UnitOfMeasureUpdateDTO {
  tenantId?: string;
  name?: string;
  code?: string;
  description?: string;
}
