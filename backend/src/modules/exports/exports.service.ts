export { }; // Empty export to force module scope

import { stringify } from 'csv-stringify/sync';
import { ExportFormat, ExportableModule } from './exports.types';
import { EXPORTABLE_FIELDS, EXCLUDED_FIELDS } from './exports.fields';

// Import all services
const salesService = require('../sales/sales.service');
const productsService = require('../products/products.service');
const categoriesService = require('../categories/categories.service');
const customersService = require('../customers/customers.service');
const suppliersService = require('../suppliers/suppliers.service');
const warehousesService = require('../warehouses/warehouses.service');
const purchaseOrdersService = require('../purchaseOrders/purchaseOrders.service');
const stockMovementsService = require('../stockMovements/stockMovements.service');
const warehouseProductsService = require('../warehouseProducts/warehouseProducts.service');
const unitsOfMeasureService = require('../unitsOfMeasure/unitsOfMeasure.service');
const productFormulasService = require('../productFormulas/productFormulas.service');
const saleItemsService = require('../saleItems/saleItems.service');

// Import models for resolving references
const Category = require('../../database/models/Category');
const Product = require('../../database/models/Product');
const UnitOfMeasure = require('../../database/models/UnitOfMeasure');
const Warehouse = require('../../database/models/Warehouse');
const Supplier = require('../../database/models/Supplier');
const Customer = require('../../database/models/Customer');
const Tenant = require('../../database/models/Tenant');
const User = require('../../database/models/User');

// Map modules to their services
const moduleServiceMap: Record<ExportableModule, any> = {
  sales: salesService,
  products: productsService,
  categories: categoriesService,
  customers: customersService,
  suppliers: suppliersService,
  warehouses: warehousesService,
  purchaseOrders: purchaseOrdersService,
  stockMovements: stockMovementsService,
  warehouseProducts: warehouseProductsService,
  unitsOfMeasure: unitsOfMeasureService,
  productFormulas: productFormulasService,
  saleItems: saleItemsService,
};

/**
 * Simple flatten for CSV - handles arrays and dates
 */
function flattenForCSV(obj: any): any {
  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (Array.isArray(obj[key])) {
        result[key] = JSON.stringify(obj[key]);
      } else if (obj[key] instanceof Date) {
        result[key] = obj[key].toISOString();
      } else if (obj[key] !== null && typeof obj[key] === 'object') {
        // For nested objects, stringify them
        result[key] = JSON.stringify(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
  }
  return result;
}

/**
 * Build a cache map for entity names to avoid N+1 queries
 */
async function buildEntityCache(
  tenantId: string
): Promise<{
  categories: Map<string, string>;
  products: Map<string, string>;
  units: Map<string, string>;
  warehouses: Map<string, string>;
  suppliers: Map<string, string>;
  customers: Map<string, string>;
  tenantName: string;
}> {
  const [categories, products, units, warehouses, suppliers, customers, tenant] = await Promise.all([
    Category.find({ tenant_id: tenantId }).select('_id name').lean(),
    Product.find({ tenant_id: tenantId }).select('_id name').lean(),
    UnitOfMeasure.find({ $or: [{ tenant_id: tenantId }, { tenant_id: "default" }] }).select('_id name').lean(),
    Warehouse.find({ tenant_id: tenantId }).select('_id name').lean(),
    Supplier.find({ tenant_id: tenantId }).select('_id name').lean(),
    Customer.find({ tenant_id: tenantId }).select('_id name').lean(),
    Tenant.findById(tenantId).select('name').lean(),
  ]);

  // Helper function to normalize ID to string
  const normalizeId = (id: any): string => {
    if (!id) return '';
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id.toString) return id.toString();
    return String(id);
  };

  const categoryMap = new Map<string, string>();
  categories.forEach((cat: any) => {
    const id = normalizeId(cat._id);
    categoryMap.set(id, cat.name);
  });

  const productMap = new Map<string, string>();
  products.forEach((prod: any) => {
    const id = normalizeId(prod._id);
    productMap.set(id, prod.name);
  });

  const unitMap = new Map<string, string>();
  units.forEach((unit: any) => {
    const id = normalizeId(unit._id);
    unitMap.set(id, unit.name);
  });

  const warehouseMap = new Map<string, string>();
  warehouses.forEach((wh: any) => {
    const id = normalizeId(wh._id);
    warehouseMap.set(id, wh.name);
  });

  const supplierMap = new Map<string, string>();
  suppliers.forEach((sup: any) => {
    const id = normalizeId(sup._id);
    supplierMap.set(id, sup.name);
  });

  const customerMap = new Map<string, string>();
  customers.forEach((cust: any) => {
    const id = normalizeId(cust._id);
    customerMap.set(id, cust.name);
  });

  return {
    categories: categoryMap,
    products: productMap,
    units: unitMap,
    warehouses: warehouseMap,
    suppliers: supplierMap,
    customers: customerMap,
    tenantName: tenant?.name || '',
  };
}

/**
 * Resolve references in data items and transform for export
 */
async function transformDataForExport(
  module: ExportableModule,
  data: any[],
  userId: string
): Promise<any[]> {
  if (!data || data.length === 0) {
    return [];
  }

  // Get user's tenant_id
  const user = await User.findById(userId).lean();
  if (!user || !user.tenant_id) {
    return [];
  }
  const tenantId = user.tenant_id;

  // Build entity cache
  const cache = await buildEntityCache(tenantId);

  // Convert Mongoose documents to plain objects
  const plainData = data.map(item => (item.toObject ? item.toObject() : item));

  // Get exportable fields for this module
  const exportableFields = EXPORTABLE_FIELDS[module];

  // Helper function to normalize ID to string
  const normalizeId = (id: any): string => {
    if (!id) return '';
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id.toString) return id.toString();
    return String(id);
  };

  return plainData.map((item: any) => {
    const transformed: any = {};

    // Get tenant_name
    const tenantName = cache.tenantName;

    for (const field of exportableFields) {
      // Skip excluded fields
      if (EXCLUDED_FIELDS.includes(field)) {
        continue;
      }

      // Handle special field mappings
      switch (field) {
        case 'tenant_name':
          transformed.tenant_name = tenantName;
          break;

        case 'parent_name':
          if (item.parent_id) {
            const id = normalizeId(item.parent_id);
            transformed.parent_name = cache.categories.get(id) || '';
          } else {
            transformed.parent_name = '';
          }
          break;

        case 'category_name':
          if (item.category_id) {
            // Handle populated category_id (object with name property)
            if (typeof item.category_id === 'object' && item.category_id !== null) {
              // If it has a name property, use it directly
              if (item.category_id.name) {
                transformed.category_name = item.category_id.name;
              } else if (item.category_id._id) {
                // If it has _id but no name, look it up using the _id
                const id = normalizeId(item.category_id._id);
                transformed.category_name = cache.categories.get(id) || '';
              } else {
                // Fallback: try to normalize the whole object
                const id = normalizeId(item.category_id);
                transformed.category_name = cache.categories.get(id) || '';
              }
            } else {
              // Handle category_id as ID reference (string or primitive)
              const id = normalizeId(item.category_id);
              transformed.category_name = cache.categories.get(id) || '';
            }
          } else {
            transformed.category_name = '';
          }
          break;

        case 'unit_name':
          if (item.unit_id) {
            // Handle populated unit_id (object with name property)
            if (typeof item.unit_id === 'object' && item.unit_id !== null) {
              // If it has a name property, use it directly
              if (item.unit_id.name) {
                transformed.unit_name = item.unit_id.name;
              } else if (item.unit_id._id) {
                // If it has _id but no name, look it up using the _id
                const id = normalizeId(item.unit_id._id);
                transformed.unit_name = cache.units.get(id) || '';
              } else {
                // Fallback: try to normalize the whole object
                const id = normalizeId(item.unit_id);
                transformed.unit_name = cache.units.get(id) || '';
              }
            } else {
              // Handle unit_id as ID reference (string or primitive)
              const id = normalizeId(item.unit_id);
              transformed.unit_name = cache.units.get(id) || '';
            }
          } else {
            transformed.unit_name = '';
          }
          break;

        case 'reference_unit_name':
          if (item.reference_unit_id) {
            // Handle populated reference_unit_id (object with name property)
            if (typeof item.reference_unit_id === 'object' && item.reference_unit_id !== null) {
              // If it has a name property, use it directly
              if (item.reference_unit_id.name) {
                transformed.reference_unit_name = item.reference_unit_id.name;
              } else if (item.reference_unit_id._id) {
                // If it has _id but no name, look it up using the _id
                const id = normalizeId(item.reference_unit_id._id);
                transformed.reference_unit_name = cache.units.get(id) || '';
              } else {
                // Fallback: try to normalize the whole object
                const id = normalizeId(item.reference_unit_id);
                transformed.reference_unit_name = cache.units.get(id) || '';
              }
            } else {
              // Handle reference_unit_id as ID reference (string or primitive)
              const id = normalizeId(item.reference_unit_id);
              transformed.reference_unit_name = cache.units.get(id) || '';
            }
          } else {
            transformed.reference_unit_name = '';
          }
          break;

        case 'warehouse_name':
          if (item.warehouse_id) {
            const id = normalizeId(item.warehouse_id);
            transformed.warehouse_name = cache.warehouses.get(id) || '';
          } else {
            transformed.warehouse_name = '';
          }
          break;

        case 'supplier_name':
          if (item.supplier_id) {
            const id = normalizeId(item.supplier_id);
            transformed.supplier_name = cache.suppliers.get(id) || '';
          } else {
            transformed.supplier_name = '';
          }
          break;

        case 'product_name':
          if (item.product_id) {
            // Handle populated product_id (object with name property)
            if (typeof item.product_id === 'object' && item.product_id !== null) {
              // If it has a name property, use it directly
              if (item.product_id.name) {
                transformed.product_name = item.product_id.name;
              } else if (item.product_id._id) {
                // If it has _id but no name, look it up using the _id
                const id = normalizeId(item.product_id._id);
                transformed.product_name = cache.products.get(id) || '';
              } else {
                // Fallback: try to normalize the whole object
                const id = normalizeId(item.product_id);
                transformed.product_name = cache.products.get(id) || '';
              }
            } else {
              // Handle product_id as ID reference (string or primitive)
              const id = normalizeId(item.product_id);
              transformed.product_name = cache.products.get(id) || '';
            }
          } else {
            transformed.product_name = '';
          }
          break;

        case 'items':
          // For ProductFormulas, transform items array
          if (item.items && Array.isArray(item.items)) {
            transformed.items = item.items.map((formulaItem: any) => {
              // Handle product_id (might be populated or just ID)
              let productName = '';
              if (formulaItem.product_id) {
                if (typeof formulaItem.product_id === 'object' && formulaItem.product_id !== null) {
                  if (formulaItem.product_id.name) {
                    productName = formulaItem.product_id.name;
                  } else if (formulaItem.product_id._id) {
                    const productId = normalizeId(formulaItem.product_id._id);
                    productName = cache.products.get(productId) || '';
                  } else {
                    const productId = normalizeId(formulaItem.product_id);
                    productName = cache.products.get(productId) || '';
                  }
                } else {
                  const productId = normalizeId(formulaItem.product_id);
                  productName = cache.products.get(productId) || '';
                }
              }

              // Handle unit_id (might be populated or just ID)
              let unitName = '';
              if (formulaItem.unit_id) {
                if (typeof formulaItem.unit_id === 'object' && formulaItem.unit_id !== null) {
                  if (formulaItem.unit_id.name) {
                    unitName = formulaItem.unit_id.name;
                  } else if (formulaItem.unit_id._id) {
                    const unitId = normalizeId(formulaItem.unit_id._id);
                    unitName = cache.units.get(unitId) || '';
                  } else {
                    const unitId = normalizeId(formulaItem.unit_id);
                    unitName = cache.units.get(unitId) || '';
                  }
                } else {
                  const unitId = normalizeId(formulaItem.unit_id);
                  unitName = cache.units.get(unitId) || '';
                }
              }

              return {
                product_name: productName,
                unit_name: unitName,
                quantity: formulaItem.quantity,
              };
            });
          } else {
            transformed.items = [];
          }
          break;

        default:
          // Copy the field as-is if it exists
          if (item.hasOwnProperty(field)) {
            transformed[field] = item[field];
          }
          break;
      }
    }

    return transformed;
  });
}

/**
 * Convert data to CSV format using csv-stringify
 */
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Flatten data (handle arrays and dates)
  const flattenedData = data.map(item => flattenForCSV(item));

  // Get all unique keys from all objects
  const allKeys = new Set<string>();
  flattenedData.forEach(item => {
    Object.keys(item).forEach(key => allKeys.add(key));
  });

  const headers = Array.from(allKeys).sort();

  // Create records for csv-stringify
  const records = flattenedData.map(item => {
    return headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) {
        return '';
      }
      return String(value);
    });
  });

  // Use csv-stringify to generate CSV with proper escaping
  return stringify([headers, ...records], {
    header: false,
    quoted: true,
    quoted_empty: true,
  });
}

/**
 * Convert data to JSON format
 */
function convertToJSON(data: any[]): string {
  // Data is already transformed to plain objects
  return JSON.stringify(data, null, 2);
}

/**
 * Get data for a specific module
 */
async function getModuleData(module: ExportableModule, userId: string): Promise<any[]> {
  const service = moduleServiceMap[module];
  if (!service) {
    throw new Error(`Module ${module} not found`);
  }

  // All services have a getAll method that takes userId
  const data = await service.getAll(userId);
  return Array.isArray(data) ? data : [];
}

/**
 * Export data for a specific module in the requested format
 */
async function exportData(
  module: ExportableModule,
  format: ExportFormat,
  userId: string
): Promise<{ content: string; filename: string; mimeType: string }> {
  const rawData = await getModuleData(module, userId);

  // Transform data: filter fields, resolve references
  const transformedData = await transformDataForExport(module, rawData, userId);

  let content: string;
  let filename: string;
  let mimeType: string;

  if (format === 'csv') {
    content = convertToCSV(transformedData);
    filename = `${module}_export_${new Date().toISOString().split('T')[0]}.csv`;
    mimeType = 'text/csv';
  } else {
    content = convertToJSON(transformedData);
    filename = `${module}_export_${new Date().toISOString().split('T')[0]}.json`;
    mimeType = 'application/json';
  }

  return { content, filename, mimeType };
}

module.exports = {
  exportData,
  getModuleData,
};

