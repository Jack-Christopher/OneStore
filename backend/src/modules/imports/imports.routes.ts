export { }; // Empty export to force module scope

const express = require("express");
const controller = require("./imports.controller");
const authGuard = require("../../shared/middlewares/authGuard");

const router = express.Router();

router.post(
  "/:module/:format",
  authGuard,
  controller.upload.single('file'),
  controller.importModule
);

module.exports = router;

