export { };
const express = require("express");
const controller = require("./exchangeRates.controller");
const authGuard = require("../../shared/middlewares/authGuard");

const router = express.Router();

router.get("/latest", authGuard, controller.getLatest);
router.get("/", authGuard, controller.getByDate);

module.exports = router;
