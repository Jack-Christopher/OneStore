export { }; // Empty export to force module scope

export type ImportFormat = 'csv' | 'json';

export type ImportableModule = 
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

