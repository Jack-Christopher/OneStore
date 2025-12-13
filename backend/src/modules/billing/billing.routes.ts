export { }; // Empty export to force module scope

const express = require("express");
const controller = require("./billing.controller");
const authGuard = require("../../shared/middlewares/authGuard");
const multer = require("multer");

// Configure multer for file uploads (memory storage for CSV parsing)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    // Accept CSV and Excel files
    const isCSV = file.mimetype === 'text/csv' || file.originalname.endsWith('.csv');
    const isExcel = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                    file.mimetype === 'application/vnd.ms-excel' ||
                    file.originalname.endsWith('.xlsx') ||
                    file.originalname.endsWith('.xls');
    
    if (isCSV || isExcel) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV o Excel (.csv, .xlsx, .xls)'), false);
    }
  }
});

const router = express.Router();

// Routes para cada tipo de documento
const documentRouteMap: Record<string, string> = {
  'invoices': 'invoice',
  'sale-tickets': 'sale_ticket',
  'credit-notes': 'credit_note',
  'debit-notes': 'debit_note',
  'sale-notes': 'sale_note',
  'proformas': 'proforma',
};

Object.entries(documentRouteMap).forEach(([routePath, documentType]) => {
  const basePath = `/${routePath}`;
  
  // GET /api/billing/{type} - Listar documentos
  router.get(basePath, authGuard, (req: any, res: any, next: any) => {
    req.params.documentType = documentType;
    controller.getAll(req, res, next);
  });
  
  // GET /api/billing/{type}/:id - Obtener documento
  router.get(`${basePath}/:id`, authGuard, (req: any, res: any, next: any) => {
    req.params.documentType = documentType;
    controller.getOne(req, res, next);
  });
  
  // POST /api/billing/{type} - Crear documento
  router.post(basePath, authGuard, (req: any, res: any, next: any) => {
    req.params.documentType = documentType;
    controller.create(req, res, next);
  });
  
  // PUT /api/billing/{type}/:id - Actualizar documento
  router.put(`${basePath}/:id`, authGuard, (req: any, res: any, next: any) => {
    req.params.documentType = documentType;
    controller.update(req, res, next);
  });
  
  // DELETE /api/billing/{type}/:id - Eliminar documento
  router.delete(`${basePath}/:id`, authGuard, (req: any, res: any, next: any) => {
    req.params.documentType = documentType;
    controller.remove(req, res, next);
  });
});

// Items routes - GET /api/billing/documents/:documentType/:documentId/items
router.get("/documents/:documentType/:documentId/items", authGuard, controller.getDocumentItems);

// Items routes - POST /api/billing/documents/:documentType/:documentId/items
router.post("/documents/:documentType/:documentId/items", authGuard, controller.createDocumentItem);

// Import route - POST /api/billing/import/keyfacil
router.post("/import/keyfacil", authGuard, upload.single("file"), controller.importFromKeyfacil);

module.exports = router;

