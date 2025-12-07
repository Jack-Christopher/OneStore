export { }; // Empty export to force module scope

const express = require("express");
const router = express.Router();
const controller = require("./admin.controller");
const authGuard = require("../../shared/middlewares/authGuard");
const requireRole = require("../../shared/middlewares/requireRole");

router.post("/tenants", authGuard, requireRole(["admin"]), controller.createTenant);
router.get("/tenants", authGuard, requireRole(["admin"]), controller.getAllTenants);
router.put("/tenants/:id/status", authGuard, requireRole(["admin"]), controller.updateTenantStatus);
router.post("/users/manager", authGuard, requireRole(["admin"]), controller.createManager);
router.get("/users/managers", authGuard, requireRole(["admin"]), controller.getManagers);
module.exports = router;

