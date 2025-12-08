export { }; // Empty export to force module scope

export type ExportFormat = 'csv' | 'json';

export type ExportableModule = 
  | 'sales'
  | 'products'
  | 'categories'
  | 'customers'
  | 'suppliers'
  | 'warehouses'
  | 'purchaseOrders'
  | 'stockMovements'
  | 'warehouseProducts'
  | 'unitsOfMeasure'
  | 'productFormulas'
  | 'saleItems';

