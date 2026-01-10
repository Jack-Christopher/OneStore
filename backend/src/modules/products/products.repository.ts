import { ProductDTO } from '../products/products.types';

const Product = require("../../database/models/Product");
const User = require("../../database/models/User");
const SaleItem = require("../../database/models/SaleItem");
const WarehouseProduct = require("../../database/models/WarehouseProduct");

module.exports = {
  findAll(user_id: string) {
    const products = User.findOne({ _id: user_id }).exec()
      .then(async (user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];

        const productsList = await Product.find({ tenant_id: tenantId })
          .populate("category_id", "name")
          .populate("unit_id", "name")
          .populate("supplier_id", "name")
          .lean();

        const warehouseProducts = await WarehouseProduct.find({ tenant_id: tenantId }).lean();

        const stockMap = new Map<string, number>();
        warehouseProducts.forEach((wp: { product_id: string; quantity?: number }) => {
          const current = stockMap.get(wp.product_id) || 0;
          stockMap.set(wp.product_id, current + (wp.quantity || 0));
        });

        return productsList.map((product: { _id: { toString: () => string };[key: string]: any }) => ({
          ...product,
          currentStock: stockMap.get(product._id.toString()) || 0
        }));
      });

    return products;
  },

  findMostSold(user_id: string) {
    const products = User.findOne({ _id: user_id }).exec()
      .then(async (user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];

        // Step 1: Find products for this tenant
        const allProducts = await Product.find({ tenant_id: tenantId })
          .populate("category_id", "name")
          .populate("unit_id", "name")
          .populate("supplier_id", "name")
          .lean();

        // Step 2: Aggregate sale items for total sold by product
        const salesData = await SaleItem.aggregate([
          { $match: { tenant_id: tenantId } },
          {
            $group: {
              _id: "$product_id",
              total_quantity_sold: { $sum: "$quantity" }
            }
          }
        ]);

        // Step 3: Map sales data by product id for quick lookup
        const salesMap = new Map<string, number>();
        for (const entry of salesData) {
          if (entry._id && typeof entry.total_quantity_sold === "number") {
            salesMap.set(String(entry._id), entry.total_quantity_sold);
          }
        }

        // Step 4: Attach total_quantity_sold to each product (default to 0 for products with no sales)
        const mergedProducts = allProducts.map((product: any) => ({
          _id: product._id,
          name: product.name,
          sku: product.sku,
          sale_price: product.sale_price,
          total_quantity_sold: salesMap.get(String(product._id)) || 0
        }));

        // Step 5: Sort in descending order by total_quantity_sold
        mergedProducts.sort((a: any, b: any) => b.total_quantity_sold - a.total_quantity_sold);

        return mergedProducts;
      });

    return products;
  },

  findById(id: string) {
    return Product.findById(id)
      .populate("category_id", "name")
      .populate("unit_id", "name")
      .populate("supplier_id", "name")
      .lean();
  },

  create(data: ProductDTO) {
    return Product.create(data).then((product: any) => {
      return Product.findById(product._id)
        .populate("category_id", "name")
        .populate("unit_id", "name")
        .populate("supplier_id", "name")
        .lean();
    });
  },

  update(id: string, data: ProductDTO) {
    return Product.findByIdAndUpdate(id, data, { new: true })
      .populate("category_id", "name")
      .populate("unit_id", "name")
      .populate("supplier_id", "name")
      .lean();
  },

  delete(id: string) {
    return Product.findByIdAndDelete(id);
  }
};
