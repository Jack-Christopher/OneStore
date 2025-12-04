export {}; // Empty export to force module scope

const express = require("express");
const controller = require("./saleItems.controller");
const authGuard = require("../../shared/middlewares/authGuard");

const router = express.Router();

// add the bysaleId and create many
router.get("/", authGuard, controller.getAll);
router.get("/sale/:id", authGuard, controller.getAllbySaleId);
router.get("/:id", authGuard, controller.getOne);
router.post("/", authGuard, controller.create);
router.post("/add-many", authGuard, controller.createMany);
router.put("/:id", authGuard, controller.update);
router.delete("/:id", authGuard, controller.remove);

module.exports = router;
