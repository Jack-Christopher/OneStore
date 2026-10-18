export { };
const express = require("express");
const controller = require("./ruc.controller");
const authGuard = require("../../shared/middlewares/authGuard");

const router = express.Router();

router.get("/:ruc", authGuard, controller.lookup);

module.exports = router;
