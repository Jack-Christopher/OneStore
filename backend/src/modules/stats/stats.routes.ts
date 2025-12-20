export { }; // Empty export to force module scope

const express = require("express");
const authGuard = require("../../shared/middlewares/authGuard");

const salesController = require("./sales.controller");
const purchasesController = require("./purchases.controller");
const productsController = require("./products.controller");
const stockController = require("./stock.controller");
const usersController = require("./users.controller");
const overviewController = require("./overview.controller");

const router = express.Router();

// Sales stats
router.get("/sales/summary", authGuard, salesController.getSummary);
router.get("/sales/by-day", authGuard, salesController.getByDay);
router.get("/sales/by-month", authGuard, salesController.getByMonth);
router.get("/sales/top-products", authGuard, salesController.getTopProducts);
router.get("/sales/by-payment-method", authGuard, salesController.getByPaymentMethod);
router.get("/sales/by-hour", authGuard, salesController.getByHour);
router.get("/sales/average-ticket-by-day", authGuard, salesController.getAverageTicketByDay);
router.get("/sales/by-warehouse", authGuard, salesController.getByWarehouse);
router.get("/sales/top-customers", authGuard, salesController.getTopCustomers);
router.get("/sales/by-category", authGuard, salesController.getSalesByCategory);
router.get("/sales/product-margins", authGuard, salesController.getProductMargins);
router.get("/sales/activity", authGuard, salesController.getSalesActivity);
router.get("/sales/by-date", authGuard, salesController.getSalesByDate);

// Purchases stats
router.get("/purchases/summary", authGuard, purchasesController.getSummary);
router.get("/purchases/by-month", authGuard, purchasesController.getByMonth);
router.get("/purchases/by-supplier", authGuard, purchasesController.getBySupplier);
router.get("/purchases/activity", authGuard, purchasesController.getPurchasesActivity);
router.get("/purchases/by-date", authGuard, purchasesController.getPurchasesByDate);

// Products stats
router.get("/products/added-by-month", authGuard, productsController.getAddedByMonth);
router.get("/products/low-stock", authGuard, productsController.getLowStock);

// Stock stats
router.get("/products/stock-value", authGuard, stockController.getStockValue);
router.get("/stock/movement-types-frequency", authGuard, stockController.getMovementTypesFrequency);
router.get("/stock/inventory-evolution", authGuard, stockController.getInventoryEvolution);
router.get("/stock/user-activity", authGuard, stockController.getUserActivity);
router.get("/stock/operations-activity", authGuard, stockController.getOperationsActivity);
router.get("/stock/operations-by-date", authGuard, stockController.getOperationsByDate);

// Users stats
router.get("/users/count", authGuard, usersController.getCount);

// Overview/Dashboard
router.get("/overview/dashboard", authGuard, overviewController.getDashboard);

module.exports = router;

