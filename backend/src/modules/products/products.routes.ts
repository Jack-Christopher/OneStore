const express = require("express");
const { productsController } = require("./products.controller");

module.exports.productsRoutes = (() => {
  const r = express.Router();
  const c = productsController;
  r.get("/", c.list);
  r.post("/", c.create);
  return r;
})();