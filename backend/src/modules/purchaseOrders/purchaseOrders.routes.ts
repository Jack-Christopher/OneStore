export {}; // Empty export to force module scope

const express = require("express");
const controller = require("./purchaseOrders.controller");
const authGuard = require("../../shared/middlewares/authGuard");
const multer = require("multer");

// Configure multer for file uploads (memory storage for CSV/Excel parsing)
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

// Purchase Orders
router.get("/", authGuard, controller.getAll);
router.get("/:id", authGuard, controller.getOne);
router.post("/", authGuard, controller.create);
router.post("/with-items", authGuard, controller.createWithItems);
router.put("/:id", authGuard, controller.update);
router.delete("/:id", authGuard, controller.remove);
router.post("/:id/receive", authGuard, controller.receiveOrder);

// Purchase Order Items
router.get("/:id/items", authGuard, controller.getItemsByOrderId);
router.post("/:id/items", authGuard, controller.createItem);
router.post("/:id/items/bulk", authGuard, controller.createManyItems);
router.put("/:id/items/:itemId", authGuard, controller.updateItem);
router.delete("/:id/items/:itemId", authGuard, controller.removeItem);

// Import route - POST /api/purchase-orders/import/keyfacil
router.post("/import/keyfacil", authGuard, upload.single("file"), controller.importFromKeyfacil);

module.exports = router;

