export {}; // Empty export to force module scope

const express = require("express");
const controller = require("./purchaseOrders.controller");
const authGuard = require("../../shared/middlewares/authGuard");

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

module.exports = router;

