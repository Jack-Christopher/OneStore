export { }; // Empty export to force module scope

import type { ExportFormat, ExportableModule } from "./exports.types";

const service = require("./exports.service");
const { ok, fail } = require("../../shared/utils/response");

async function exportModule(req: Req, res: Res) {
  try {
    const { module, format } = req.params;
    const userId = req?.user?.id;

    if (!userId) {
      return fail(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    // Validate module
    const validModules: ExportableModule[] = [
      'sales',
      'products',
      'categories',
      'customers',
      'suppliers',
      'warehouses',
      'purchaseOrders',
      'stockMovements',
      'warehouseProducts',
      'unitsOfMeasure',
      'productFormulas',
      'saleItems',
    ];

    if (!validModules.includes(module as ExportableModule)) {
      return fail(res, `Invalid module: ${module}`, "INVALID_MODULE", 400);
    }

    // Validate format
    const validFormats: ExportFormat[] = ['csv', 'json'];
    if (!validFormats.includes(format as ExportFormat)) {
      return fail(res, `Invalid format: ${format}. Must be 'csv' or 'json'`, "INVALID_FORMAT", 400);
    }

    const result = await service.exportData(module as ExportableModule, format as ExportFormat, userId);

    // Set headers for file download
    res.setHeader('Content-Type', result.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);

    return res.send(result.content);
  } catch (error: any) {
    console.error('Export error:', error);
    return fail(res, error.message || "Export failed", "EXPORT_ERROR", 500);
  }
}

async function getAvailableModules(req: Req, res: Res) {
  const modules = [
    { name: 'sales', label: 'Sales' },
    { name: 'products', label: 'Products' },
    { name: 'categories', label: 'Categories' },
    { name: 'customers', label: 'Customers' },
    { name: 'suppliers', label: 'Suppliers' },
    { name: 'warehouses', label: 'Warehouses' },
    { name: 'purchaseOrders', label: 'Purchase Orders' },
    { name: 'stockMovements', label: 'Stock Movements' },
    { name: 'warehouseProducts', label: 'Warehouse Products' },
    { name: 'unitsOfMeasure', label: 'Units of Measure' },
    { name: 'productFormulas', label: 'Product Formulas' },
    { name: 'saleItems', label: 'Sale Items' },
  ];

  return ok(res, modules);
}

module.exports = {
  exportModule,
  getAvailableModules,
};

