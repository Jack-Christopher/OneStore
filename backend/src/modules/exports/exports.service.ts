export { }; // Empty export to force module scope

import { stringify } from 'csv-stringify/sync';
import { ExportFormat, ExportableModule } from './exports.types';

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
 * Flatten nested objects for CSV export
 */
function flattenObject(obj: any, prefix = '', result: any = {}): any {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
        // Recursively flatten nested objects
        flattenObject(obj[key], newKey, result);
      } else if (Array.isArray(obj[key])) {
        // Convert arrays to string representation
        result[newKey] = JSON.stringify(obj[key]);
      } else if (obj[key] instanceof Date) {
        // Convert dates to ISO string
        result[newKey] = obj[key].toISOString();
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
}

/**
 * Convert data to CSV format using csv-stringify
 */
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  // Flatten all objects
  const flattenedData = data.map(item => {
    const itemObj = item.toObject ? item.toObject() : item;
    return flattenObject(itemObj);
  });

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
  const jsonData = data.map(item => {
    if (item.toObject) {
      return item.toObject();
    }
    return item;
  });
  return JSON.stringify(jsonData, null, 2);
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
  const data = await getModuleData(module, userId);

  let content: string;
  let filename: string;
  let mimeType: string;

  if (format === 'csv') {
    content = convertToCSV(data);
    filename = `${module}_export_${new Date().toISOString().split('T')[0]}.csv`;
    mimeType = 'text/csv';
  } else {
    content = convertToJSON(data);
    filename = `${module}_export_${new Date().toISOString().split('T')[0]}.json`;
    mimeType = 'application/json';
  }

  return { content, filename, mimeType };
}

module.exports = {
  exportData,
  getModuleData,
};

