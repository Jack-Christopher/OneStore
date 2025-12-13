export { }; // Empty export to force module scope

import { ExportableModule } from './exports.types';

/**
 * Fields to export for each module, excluding internal MongoDB fields
 * and replacing reference IDs with meaningful names
 */
export const EXPORTABLE_FIELDS: Record<ExportableModule, string[]> = {
  categories: ['name', 'description', 'parent_name', 'created_at', 'updated_at', 'tenant_name'],
  products: ['name', 'sku', 'barcode', 'description', 'category_name', 'unit_name', 'purchase_price', 'sale_price', 'min_stock', 'max_stock', 'is_active', 'created_at', 'updated_at', 'tenant_name'],
  customers: ['name', 'document', 'phone', 'email', 'address', 'is_active', 'created_at', 'updated_at', 'tenant_name'],
  suppliers: ['name', 'contact_name', 'document', 'phone', 'email', 'address', 'created_at', 'updated_at', 'tenant_name'],
  warehouses: ['name', 'address', 'phone', 'is_active', 'created_at', 'updated_at', 'tenant_name'],
  unitsOfMeasure: ['code', 'name', 'description', 'created_at', 'updated_at', 'tenant_name'],
  sales: ['customer_name', 'customer_document', 'warehouse_name', 'status', 'payment_method', 'currency_code', 'exchange_rate', 'total_original', 'total_base', 'notes', 'created_at', 'updated_at', 'tenant_name'],
  purchaseOrders: ['supplier_name', 'warehouse_name', 'reference_number', 'status', 'currency_code', 'exchange_rate', 'total_original', 'total_base', 'notes', 'created_at', 'updated_at', 'tenant_name'],
  stockMovements: ['warehouse_name', 'product_name', 'movement_type', 'quantity', 'comment', 'created_at', 'updated_at', 'tenant_name'],
  warehouseProducts: ['warehouse_name', 'product_name', 'quantity', 'reserved', 'available', 'created_at', 'updated_at', 'tenant_name'],
  productFormulas: ['name', 'description', 'reference_quantity', 'reference_unit_name', 'items', 'is_active', 'created_at', 'updated_at', 'tenant_name'],
  saleItems: ['sale_id', 'product_name', 'unit_name', 'quantity', 'unit_price_original', 'unit_price_base', 'subtotal', 'created_at', 'updated_at', 'tenant_name'],
};

/**
 * Fields that should be excluded from export (internal MongoDB/system fields)
 */
export const EXCLUDED_FIELDS = [
  '_id',
  '__v',
  'created_by',
  'updated_by',
  'metadata',
];

/**
 * Fields that contain MongoDB ObjectId buffers (should be excluded)
 */
export const EXCLUDE_BUFFER_PATTERNS = [
  /^_id\.buffer\./,
  /\.buffer\./,
];

