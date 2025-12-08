export { }; // Empty export to force module scope

import { parse } from 'csv-parse/sync';
import { ImportFormat, ImportableModule } from './imports.types';
import { toSnakeCase } from '../../shared/utils/object';

const User = require('../../database/models/User');

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

// Map modules to their services
const moduleServiceMap: Record<ImportableModule, any> = {
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
 * Unflatten object (convert dot notation back to nested objects)
 */
function unflattenObject(obj: any): any {
  const result: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const keys = key.split('.');
      let current = result;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = obj[key];
    }
  }
  return result;
}

/**
 * Parse CSV content to array of objects
 */
function parseCSV(content: string): any[] {
  try {
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      cast: (value, context) => {
        // Try to parse numbers
        if (context.header) return value;
        if (value === '' || value === null || value === undefined) return null;
        const numValue = Number(value);
        if (!isNaN(numValue) && value.trim() !== '') {
          return numValue;
        }
        // Try to parse booleans
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
        // Try to parse JSON strings
        if (value.startsWith('[') || value.startsWith('{')) {
          try {
            return JSON.parse(value);
          } catch {
            return value;
          }
        }
        return value;
      },
    });

    // Unflatten objects that were flattened during export
    return records.map(record => unflattenObject(record));
  } catch (error: any) {
    throw new Error(`Error parsing CSV: ${error.message}`);
  }
}

/**
 * Parse JSON content to array of objects
 */
function parseJSON(content: string): any[] {
  try {
    const data = JSON.parse(content);
    if (!Array.isArray(data)) {
      throw new Error('JSON data must be an array');
    }
    return data;
  } catch (error: any) {
    throw new Error(`Error parsing JSON: ${error.message}`);
  }
}

/**
 * Get tenant_id from user_id
 */
async function getTenantId(userId: string): Promise<string> {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user.tenant_id;
}

/**
 * Import data for a specific module
 */
async function importData(
  module: ImportableModule,
  format: ImportFormat,
  content: string,
  userId: string
): Promise<{ success: number; failed: number; errors: string[] }> {
  const service = moduleServiceMap[module];
  if (!service) {
    throw new Error(`Module ${module} not found`);
  }

  // Get tenant_id from user
  const tenantId = await getTenantId(userId);
  if (tenantId === 'orphan') {
    throw new Error('User does not have a valid tenant');
  }

  // Parse data based on format
  let data: any[];
  if (format === 'csv') {
    data = parseCSV(content);
  } else {
    data = parseJSON(content);
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No data to import');
  }

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  // Import each record
  for (let i = 0; i < data.length; i++) {
    try {
      const record = data[i];
      
      // Convert to snake_case if needed (check if keys are camelCase)
      const hasCamelCase = Object.keys(record).some(key => /[A-Z]/.test(key));
      const formattedRecord = hasCamelCase ? toSnakeCase(record) : record;

      // Add tenant_id if not present
      if (!formattedRecord.tenant_id && !formattedRecord.tenantId) {
        formattedRecord.tenant_id = tenantId;
      } else if (formattedRecord.tenantId) {
        formattedRecord.tenant_id = formattedRecord.tenantId;
        delete formattedRecord.tenantId;
      }
      
      // Use create method from service
      await service.create(formattedRecord);
      success++;
    } catch (error: any) {
      failed++;
      errors.push(`Row ${i + 1}: ${error.message || 'Unknown error'}`);
    }
  }

  return { success, failed, errors };
}

module.exports = {
  importData,
};

