export { }; // Empty export to force module scope

import type { ImportFormat, ImportableModule } from "./imports.types";

const service = require("./imports.service");
const { ok, fail } = require("../../shared/utils/response");
const multer = require("multer");

// Configure multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

async function importModule(req: Req, res: Res) {
  try {
    const { module, format } = req.params;
    const userId = req?.user?.id;

    if (!userId) {
      return fail(res, "User not authenticated", "UNAUTHORIZED", 401);
    }

    // Validate module
    const validModules: ImportableModule[] = [
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

    if (!validModules.includes(module as ImportableModule)) {
      return fail(res, `Invalid module: ${module}`, "INVALID_MODULE", 400);
    }

    // Validate format
    const validFormats: ImportFormat[] = ['csv', 'json'];
    if (!validFormats.includes(format as ImportFormat)) {
      return fail(res, `Invalid format: ${format}. Must be 'csv' or 'json'`, "INVALID_FORMAT", 400);
    }

    // Get file content from request body or file upload
    let content: string;
    
    if (req.file) {
      // File uploaded via multer
      content = req.file.buffer.toString('utf-8');
    } else if (req.body.content) {
      // Content sent as JSON in body
      content = req.body.content;
    } else {
      return fail(res, "No file or content provided", "NO_CONTENT", 400);
    }

    if (!content || content.trim().length === 0) {
      return fail(res, "File content is empty", "EMPTY_CONTENT", 400);
    }

    const result = await service.importData(
      module as ImportableModule,
      format as ImportFormat,
      content,
      userId
    );

    return ok(res, result);
  } catch (error: any) {
    console.error('Import error:', error);
    return fail(res, error.message || "Import failed", "IMPORT_ERROR", 500);
  }
}

module.exports = {
  importModule,
  upload,
};

