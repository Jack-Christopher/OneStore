export {}; // Empty export to force module scope

const express = require("express");
const controller = require("./settings.controller");
const authGuard = require("../../shared/middlewares/authGuard");
const upload = require("../../shared/middlewares/upload");

const router = express.Router();

router.get("/", authGuard, controller.getAll);
router.put("/", authGuard, controller.bulkUpdate);
router.post("/uploadLogo", authGuard, upload.single("logo"), controller.uploadLogo);

module.exports = router;

