export {}; // Empty export to force module scope

const express = require("express");
const controller = require("./warehouses.controller");
const authGuard = require("../../shared/middlewares/authGuard");

const router = express.Router();

router.get("/", authGuard, controller.getAll);
router.get("/:id", authGuard, controller.getOne);
router.post("/", authGuard, controller.create);
router.put("/:id", authGuard, controller.update);
router.delete("/:id", authGuard, controller.remove);

module.exports = router;

