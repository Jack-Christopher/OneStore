export {}; // Empty export to force module scope

const express = require("express");
const controller = require("./categories.controller");
const authGuard = require("../../shared/middlewares/authGuard");

const router = express.Router();

router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.post("/", authGuard, controller.create);
router.put("/:id", authGuard, controller.update);
router.delete("/:id", authGuard, controller.remove);

module.exports = router;
