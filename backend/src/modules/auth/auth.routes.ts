export {}; // Empty export to force module scope

const express = require("express");
const router = express.Router();
const ctrl = require("./auth.controller");
router.post("/login", ctrl.login);
router.post("/register", ctrl.register);

module.exports = router;
