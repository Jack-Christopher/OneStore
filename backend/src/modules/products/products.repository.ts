import { ProductDTO } from '../products/products.types';

const Product = require("../../database/models/Product");
const User = require("../../database/models/User");
const SaleItem = require("../../database/models/SaleItem");

module.exports = {
  findAll(user_id: string) {
    const products = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];

        return Product.find({ tenant_id: tenantId })
          .populate("category_id", "name")
          .populate("unit_id", "name");
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
        const mergedProducts = allProducts.map(product => ({
          _id: product._id,
          name: product.name,
          sku: product.sku,
          sale_price: product.sale_price,
          total_quantity_sold: salesMap.get(String(product._id)) || 0
        }));

        // Step 5: Sort in descending order by total_quantity_sold
        mergedProducts.sort((a, b) => b.total_quantity_sold - a.total_quantity_sold);

        return mergedProducts;
      });

    return products;
  },

  findById(id: string) {
    return Product.findById(id)
      .populate("category_id", "name")
      .populate("unit_id", "name");
  },

  create(data: ProductDTO) {
    return Product.create(data);
  },

  update(id: string, data: ProductDTO) {
    return Product.findByIdAndUpdate(id, data, { new: true });
  },

  delete(id: string) {
    return Product.findByIdAndDelete(id);
  }
};
