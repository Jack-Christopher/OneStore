export {}; // Empty export to force module scope

const express = require("express");
const controller = require("./reports.controller");
const authGuard = require("../../shared/middlewares/authGuard");

const router = express.Router();

router.get("/dashboard", authGuard, controller.getDashboardStats);
router.get("/sales-summary", authGuard, controller.getSalesSummary);
router.get("/purchases-summary", authGuard, controller.getPurchasesSummary);
router.get("/top-products", authGuard, controller.getTopProducts);
router.get("/top-categories", authGuard, controller.getTopCategories);
router.get("/low-stock", authGuard, controller.getLowStockProducts);
router.get("/financial-summary", authGuard, controller.getFinancialSummary);
router.get("/sales-by-period", authGuard, controller.getSalesByPeriod);
router.get("/recent-sales", authGuard, controller.getRecentSales);
router.get("/recent-purchases", authGuard, controller.getRecentPurchases);

module.exports = router;

