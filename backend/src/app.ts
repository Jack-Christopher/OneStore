const expressApp = require("express")();
const cors = require("cors");
const body = require("body-parser");
const authRoutes = require("./modules/auth/auth.routes");
const { productsRoutes } = require("./modules/products/products.routes");
const errorHandler = require("./shared/middlewares/errorHandler");


expressApp.use(cors());
expressApp.use(body.json());
expressApp.use("/auth", authRoutes);
expressApp.use("/products", productsRoutes);
expressApp.use(errorHandler);
module.exports = expressApp;