export {}; // Empty export to force module scope

const express = require("express");
const controller = require("./auditLogs.controller");
const authGuard = require("../../shared/middlewares/authGuard");
const restrictAuditQuery = require("../../shared/middlewares/restrictAuditQuery");

const router = express.Router();

router.get("/allowed-users", authGuard, controller.getAllowedUsers);
router.get("/", authGuard, restrictAuditQuery, controller.listAuditLogs);
router.get("/:id", authGuard, restrictAuditQuery, controller.getOne);

module.exports = router;

