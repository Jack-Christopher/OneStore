export {}; // Empty export to force module scope

const express = require("express");
const router = express.Router();
const ctrl = require("./auth.controller");
const authGuard = require("../../shared/middlewares/authGuard");

router.post("/login", ctrl.login);
router.post("/logout", authGuard, ctrl.logout);
router.get("/profile", authGuard, ctrl.getProfile);
router.put("/profile", authGuard, ctrl.updateProfile);

module.exports = router;
