export {}; // Empty export to force module scope

const express = require("express");
const controller = require("./settings.controller");
const authGuard = require("../../shared/middlewares/authGuard");
const upload = require("../../shared/middlewares/upload");

const router = express.Router();

router.get("/", authGuard, controller.getAll);
router.put("/", authGuard, controller.bulkUpdate);
router.post("/uploadLogo", authGuard, upload.single("logo"), controller.uploadLogo);

// Base currency endpoints
router.get("/base-currency", authGuard, controller.getBaseCurrency);
router.post("/base-currency", authGuard, controller.setBaseCurrency);

// Currency rates endpoint
router.get("/currency/rates", authGuard, controller.getCurrencyRates);

module.exports = router;

