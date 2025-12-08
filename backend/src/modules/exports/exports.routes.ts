export { }; // Empty export to force module scope

const express = require("express");
const controller = require("./exports.controller");
const authGuard = require("../../shared/middlewares/authGuard");

const router = express.Router();

router.get("/modules", authGuard, controller.getAvailableModules);
router.get("/:module/:format", authGuard, controller.exportModule);

module.exports = router;

