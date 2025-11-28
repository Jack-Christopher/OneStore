const express = require("express");
const cors = require("cors");
const body = require("body-parser");

const authRoutes = require("./modules/auth/auth.routes");
const productsRoutes = require("./modules/products/products.routes");
const salesRoutes = require("./modules/sales/sales.routes");
const saleItemsRoutes = require("./modules/saleItems/saleItems.routes");
const categoriesRoutes = require("./modules/categories/categories.routes");
const unitsOfMeasureRoutes = require("./modules/unitsOfMeasure/unitsOfMeasure.routes");
const errorHandler = require("./shared/middlewares/errorHandler");

const expressApp = express();

expressApp.use(cors());
expressApp.use(body.json());

const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/products", productsRoutes);
apiRouter.use("/sales", salesRoutes);
apiRouter.use("/saleItems", saleItemsRoutes);
apiRouter.use("/categories", categoriesRoutes);
apiRouter.use("/unitsOfMeasure", unitsOfMeasureRoutes);

expressApp.use("/api", apiRouter);
expressApp.use(errorHandler);

module.exports = expressApp;