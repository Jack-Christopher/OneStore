const express = require("express");
const cors = require("cors");
const body = require("body-parser");
const path = require("path");

const authRoutes = require("./modules/auth/auth.routes");
const productsRoutes = require("./modules/products/products.routes");
const salesRoutes = require("./modules/sales/sales.routes");
const saleItemsRoutes = require("./modules/saleItems/saleItems.routes");
const categoriesRoutes = require("./modules/categories/categories.routes");
const unitsOfMeasureRoutes = require("./modules/unitsOfMeasure/unitsOfMeasure.routes");
const productFormulasRoutes = require("./modules/productFormulas/productFormulas.routes");
const suppliersRoutes = require("./modules/suppliers/suppliers.routes");
const customersRoutes = require("./modules/customers/customers.routes");
const warehousesRoutes = require("./modules/warehouses/warehouses.routes");
const purchaseOrdersRoutes = require("./modules/purchaseOrders/purchaseOrders.routes");
const stockMovementsRoutes = require("./modules/stockMovements/stockMovements.routes");
const warehouseProductsRoutes = require("./modules/warehouseProducts/warehouseProducts.routes");
const reportsRoutes = require("./modules/reports/reports.routes");
const settingsRoutes = require("./modules/settings/settings.routes");
const errorHandler = require("./shared/middlewares/errorHandler");

const expressApp = express();

expressApp.use(cors());
expressApp.use(body.json());

// Serve static files from uploads directory
expressApp.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const apiRouter = express.Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/products", productsRoutes);
apiRouter.use("/sales", salesRoutes);
apiRouter.use("/saleItems", saleItemsRoutes);
apiRouter.use("/categories", categoriesRoutes);
apiRouter.use("/unitsOfMeasure", unitsOfMeasureRoutes);
apiRouter.use("/productFormulas", productFormulasRoutes);
apiRouter.use("/suppliers", suppliersRoutes);
apiRouter.use("/customers", customersRoutes);
apiRouter.use("/warehouses", warehousesRoutes);
apiRouter.use("/purchaseOrders", purchaseOrdersRoutes);
apiRouter.use("/stockMovements", stockMovementsRoutes);
apiRouter.use("/warehouseProducts", warehouseProductsRoutes);
apiRouter.use("/reports", reportsRoutes);
apiRouter.use("/settings", settingsRoutes);

expressApp.use("/api", apiRouter);
expressApp.use(errorHandler);

module.exports = expressApp;