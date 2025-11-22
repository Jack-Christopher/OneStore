const express = require("express");
const cors = require("cors");
const body = require("body-parser");

const authRoutes = require("./modules/auth/auth.routes");
const productsRoutes = require("./modules/products/products.routes");
const categoriesRoutes = require("./modules/categories/categories.routes");
const errorHandler = require("./shared/middlewares/errorHandler");

const expressApp = express();

expressApp.use(cors());
expressApp.use(body.json());

const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/products", productsRoutes);
apiRouter.use("/categories", categoriesRoutes);

expressApp.use("/api", apiRouter);
expressApp.use(errorHandler);

module.exports = expressApp;