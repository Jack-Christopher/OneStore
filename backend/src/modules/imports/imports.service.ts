export { }; // Empty export to force module scope

import { parse } from 'csv-parse/sync';
import { ImportFormat, ImportableModule } from './imports.types';
import { toSnakeCase } from '../../shared/utils/object';

const User = require('../../database/models/User');

// Import all models
const Sale = require('../../database/models/Sale');
const Product = require('../../database/models/Product');
const Category = require('../../database/models/Category');
const Customer = require('../../database/models/Customer');
const Supplier = require('../../database/models/Supplier');
const Warehouse = require('../../database/models/Warehouse');
const PurchaseOrder = require('../../database/models/PurchaseOrder');
const StockMovement = require('../../database/models/StockMovement');
const WarehouseProduct = require('../../database/models/WarehouseProduct');
const UnitOfMeasure = require('../../database/models/UnitOfMeasure');
const ProductFormula = require('../../database/models/ProductFormula');
const SaleItem = require('../../database/models/SaleItem');

// Import all services (still needed for validation and business logic)
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

// Map modules to their models
const moduleModelMap: Record<ImportableModule, any> = {
  sales: Sale,
  products: Product,
  categories: Category,
  customers: Customer,
  suppliers: Supplier,
  warehouses: Warehouse,
  purchaseOrders: PurchaseOrder,
  stockMovements: StockMovement,
  warehouseProducts: WarehouseProduct,
  unitsOfMeasure: UnitOfMeasure,
  productFormulas: ProductFormula,
  saleItems: SaleItem,
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
 * Parse a date value from string to Date object
 */
function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    // Try to parse ISO date string or other common formats
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return null;
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

        // Try to parse dates (created_at, updated_at fields)
        if (context.column === 'created_at' || context.column === 'updated_at') {
          const date = parseDate(value);
          if (date) return date;
        }

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

    // Parse date strings to Date objects for created_at and updated_at
    return data.map(record => {
      const parsed = { ...record };
      if (parsed.created_at) {
        const date = parseDate(parsed.created_at);
        if (date) parsed.created_at = date;
      }
      if (parsed.updated_at) {
        const date = parseDate(parsed.updated_at);
        if (date) parsed.updated_at = date;
      }
      return parsed;
    });
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
  const Model = moduleModelMap[module];
  if (!Model) {
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

      // Handle dates: use created_at from file if present, always set updated_at to current date
      const now = new Date();
      let createdAt: Date = now; // Default to current date

      // Special handling for Keyfacil imports
      if (module === 'products') {
        // Products from Keyfacil never have dates, always use current date
        console.log(`[IMPORT ${module}] Row ${i + 1}: Products import - using current date: ${now.toISOString()}`);
        createdAt = now;
      } else if (module === 'purchaseOrders') {
        // Purchase Orders from Keyfacil: look for "Fecha" field in metadata first, then in root level
        let fechaFound = false;

        // Check metadata.fecha first (Keyfacil format stores dates in metadata)
        if (formattedRecord.metadata && typeof formattedRecord.metadata === 'object') {
          const metadataFecha = formattedRecord.metadata.fecha || formattedRecord.metadata.Fecha || formattedRecord.metadata.FECHA;
          if (metadataFecha !== undefined && metadataFecha !== null) {
            console.log(`[IMPORT ${module}] Row ${i + 1}: Found fecha in metadata:`, metadataFecha);
            const parsedMetadataFecha = parseDate(metadataFecha);
            if (parsedMetadataFecha) {
              createdAt = parsedMetadataFecha;
              fechaFound = true;
              console.log(`[IMPORT ${module}] Row ${i + 1}: Parsed metadata fecha to: ${parsedMetadataFecha.toISOString()}`);
            } else {
              console.log(`[IMPORT ${module}] Row ${i + 1}: Failed to parse metadata fecha:`, metadataFecha);
            }
          } else {
            console.log(`[IMPORT ${module}] Row ${i + 1}: No fecha found in metadata`);
          }
        }

        // Also check fecha field at root level (case insensitive) if not found in metadata
        if (!fechaFound) {
          const fechaField = formattedRecord.fecha || formattedRecord.Fecha || formattedRecord.FECHA;
          if (fechaField !== undefined && fechaField !== null) {
            console.log(`[IMPORT ${module}] Row ${i + 1}: Found fecha at root level:`, fechaField);
            const parsedFecha = parseDate(fechaField);
            if (parsedFecha) {
              createdAt = parsedFecha;
              fechaFound = true;
              console.log(`[IMPORT ${module}] Row ${i + 1}: Parsed root fecha to: ${parsedFecha.toISOString()}`);
            } else {
              console.log(`[IMPORT ${module}] Row ${i + 1}: Failed to parse root fecha:`, fechaField);
            }
          }
        }

        // Also check created_at if present (for regular imports, takes precedence over Fecha if both exist)
        if (formattedRecord.created_at !== undefined && formattedRecord.created_at !== null) {
          console.log(`[IMPORT ${module}] Row ${i + 1}: Found created_at field:`, formattedRecord.created_at);
          const parsedCreatedAt = parseDate(formattedRecord.created_at);
          if (parsedCreatedAt) {
            createdAt = parsedCreatedAt;
            console.log(`[IMPORT ${module}] Row ${i + 1}: Using created_at: ${parsedCreatedAt.toISOString()}`);
          } else {
            console.log(`[IMPORT ${module}] Row ${i + 1}: Failed to parse created_at:`, formattedRecord.created_at);
          }
        }

        if (!fechaFound && !formattedRecord.created_at) {
          console.log(`[IMPORT ${module}] Row ${i + 1}: No fecha found, using current date: ${now.toISOString()}`);
        }

        // Remove fecha field from root level to avoid conflicts with schema (keep it in metadata if it was there)
        delete formattedRecord.fecha;
        delete formattedRecord.Fecha;
        delete formattedRecord.FECHA;
      } else {
        // For other modules (like billing), check for "FECHA DE CREACIÓN" (billing/Keyfacil) or "created_at" (regular)
        // Check various possible field names for fecha_creacion (Keyfacil billing format)
        const fechaCreacion = formattedRecord.fecha_creacion ||
          formattedRecord['FECHA DE CREACIÓN'] ||
          formattedRecord['FECHA_DE_CREACION'] ||
          formattedRecord.fechaCreacion;

        if (fechaCreacion !== undefined && fechaCreacion !== null) {
          console.log(`[IMPORT ${module}] Row ${i + 1}: Found fecha_creacion field:`, fechaCreacion);
          const parsedFechaCreacion = parseDate(fechaCreacion);
          if (parsedFechaCreacion) {
            createdAt = parsedFechaCreacion;
            console.log(`[IMPORT ${module}] Row ${i + 1}: Parsed fecha_creacion to: ${parsedFechaCreacion.toISOString()}`);
          } else {
            console.log(`[IMPORT ${module}] Row ${i + 1}: Failed to parse fecha_creacion:`, fechaCreacion);
          }
        }

        // Also check created_at if present (for regular imports, takes precedence)
        if (formattedRecord.created_at !== undefined && formattedRecord.created_at !== null) {
          console.log(`[IMPORT ${module}] Row ${i + 1}: Found created_at field:`, formattedRecord.created_at);
          const parsedCreatedAt = parseDate(formattedRecord.created_at);
          if (parsedCreatedAt) {
            createdAt = parsedCreatedAt;
            console.log(`[IMPORT ${module}] Row ${i + 1}: Using created_at: ${parsedCreatedAt.toISOString()}`);
          } else {
            console.log(`[IMPORT ${module}] Row ${i + 1}: Failed to parse created_at:`, formattedRecord.created_at);
          }
        }

        if (!fechaCreacion && !formattedRecord.created_at) {
          console.log(`[IMPORT ${module}] Row ${i + 1}: No fecha found, using current date: ${now.toISOString()}`);
        }

        // Remove fecha_creacion fields to avoid conflicts
        delete formattedRecord.fecha_creacion;
        delete formattedRecord['FECHA DE CREACIÓN'];
        delete formattedRecord['FECHA_DE_CREACION'];
        delete formattedRecord.fechaCreacion;
      }

      // Set dates in the record (always set both)
      formattedRecord.created_at = createdAt;
      formattedRecord.updated_at = now;
      console.log(`[IMPORT ${module}] Row ${i + 1}: Final dates - created_at: ${createdAt.toISOString()}, updated_at: ${now.toISOString()}`);

      // Create document instance for validation
      const doc = new Model(formattedRecord);

      // Validate the document before inserting
      await doc.validate();

      // Use collection.insertOne to insert directly, respecting our date values
      // This bypasses Mongoose timestamps and uses our explicit values
      const docToInsert = doc.toObject();
      // Ensure _id is removed so MongoDB generates it
      delete docToInsert._id;

      await Model.collection.insertOne(docToInsert);

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

