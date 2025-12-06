export { }; // Empty export to force module scope

const express = require("express");
const controller = require("./sales.controller");
const authGuard = require("../../shared/middlewares/authGuard");

const router = express.Router();

router.get("/", authGuard, controller.getAll);
router.get("/:id", authGuard, controller.getOne);
router.post("/", authGuard, controller.create);
router.post("/with-items", authGuard, controller.createWithItems);
router.put("/:id", authGuard, controller.update);
router.delete("/:id", authGuard, controller.remove);
router.post("/:id/cancel", authGuard, controller.cancelSale);

module.exports = router;
