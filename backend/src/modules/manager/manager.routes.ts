export { }; // Empty export to force module scope

const express = require("express");
const router = express.Router();
const controller = require("./manager.controller");
const authGuard = require("../../shared/middlewares/authGuard");
const requireRole = require("../../shared/middlewares/requireRole");

router.post("/users", authGuard, requireRole(["manager"]), controller.createClerk);
router.get("/users", authGuard, requireRole(["manager"]), controller.getAllUsers);
router.put("/users/:id", authGuard, requireRole(["manager"]), controller.updateUser);
router.delete("/users/:id", authGuard, requireRole(["manager"]), controller.deleteUser);

module.exports = router;

