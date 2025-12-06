import { WarehouseProductDTO } from './warehouseProducts.types';

const WarehouseProduct = require("../../database/models/WarehouseProduct");
const User = require("../../database/models/User");

module.exports = {
  findAll(user_id: string) {
    const products = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];
        return WarehouseProduct.find({ tenant_id: tenantId });
      });

    return products;
  },

  findByWarehouse(user_id: string, warehouseId: string) {
    const products = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];
        return WarehouseProduct.find({ tenant_id: tenantId, warehouse_id: warehouseId });
      });

    return products;
  },

  findByProduct(user_id: string, productId: string) {
    const products = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];
        return WarehouseProduct.find({ tenant_id: tenantId, product_id: productId });
      });

    return products;
  },

  findByWarehouseAndProduct(tenantId: string, warehouseId: string, productId: string) {
    return WarehouseProduct.findOne({
      tenant_id: tenantId,
      warehouse_id: warehouseId,
      product_id: productId
    });
  },

  findById(id: string) {
    return WarehouseProduct.findById(id);
  },

  create(data: WarehouseProductDTO) {
    return WarehouseProduct.create(data);
  },

  update(id: string, data: WarehouseProductDTO) {
    return WarehouseProduct.findByIdAndUpdate(id, data, { new: true });
  },

  upsert(tenantId: string, warehouseId: string, productId: string, data: Partial<WarehouseProductDTO>) {
    return WarehouseProduct.findOneAndUpdate(
      { tenant_id: tenantId, warehouse_id: warehouseId, product_id: productId },
      { $set: data },
      { new: true, upsert: true }
    );
  },

  incrementQuantity(tenantId: string, warehouseId: string, productId: string, quantity: number) {
    return WarehouseProduct.findOneAndUpdate(
      { tenant_id: tenantId, warehouse_id: warehouseId, product_id: productId },
      {
        $inc: { quantity: quantity, available: quantity },
        $setOnInsert: { tenant_id: tenantId, warehouse_id: warehouseId, product_id: productId, reserved: 0 }
      },
      { new: true, upsert: true }
    );
  },

  decrementQuantity(tenantId: string, warehouseId: string, productId: string, quantity: number) {
    return WarehouseProduct.findOneAndUpdate(
      { tenant_id: tenantId, warehouse_id: warehouseId, product_id: productId },
      { $inc: { quantity: -quantity, available: -quantity } },
      { new: true }
    );
  },

  delete(id: string) {
    return WarehouseProduct.findByIdAndDelete(id);
  },

  // Low stock products
  findLowStock(user_id: string) {
    const products = User.findOne({ _id: user_id }).exec()
      .then(async (user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];

        // Get products with stock info
        const Product = require("../../database/models/Product");
        const warehouseProducts = await WarehouseProduct.find({ tenant_id: tenantId }).lean();

        const productsWithStock = await Product.find({ tenant_id: tenantId }).lean();

        return productsWithStock.map((product: any) => {
          const stockInfo = warehouseProducts.filter((wp: any) => wp.product_id === product._id.toString());
          const totalQuantity = stockInfo.reduce((sum: number, wp: any) => sum + (wp.quantity || 0), 0);
          return {
            ...product,
            total_quantity: totalQuantity,
            is_low_stock: totalQuantity <= (product.min_stock || 0)
          };
        }).filter((p: any) => p.is_low_stock);
      });

    return products;
  }
};

