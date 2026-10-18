import { StockMovementDTO } from './stockMovements.types';

const StockMovement = require("../../database/models/StockMovement");
const User = require("../../database/models/User");

module.exports = {
  findAll(user_id: string) {
    const movements = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];
        return StockMovement.find({ tenant_id: tenantId }).sort({ created_at: -1 });
      });

    return movements;
  },

  findByWarehouse(user_id: string, warehouseId: string) {
    const movements = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];
        return StockMovement.find({ tenant_id: tenantId, warehouse_id: warehouseId }).sort({ created_at: -1 });
      });

    return movements;
  },

  findKardex(user_id: string, productId: string, warehouseId?: string) {
    return User.findOne({ _id: user_id }).exec()
      .then(async (user: any) => {
        const tenantId = user?.tenant_id;
        if (!tenantId || tenantId === "orphan") return [];

        const query: any = { tenant_id: tenantId, product_id: productId };
        if (warehouseId) query.warehouse_id = warehouseId;

        const movements = await StockMovement.find(query).sort({ created_at: 1 }).lean();
        const inbound = new Set(["purchase", "adjustment_in", "transfer_in"]);
        let balance = 0;

        return movements.map((movement: any) => {
          const quantity = Number(movement.quantity) || 0;
          balance += inbound.has(movement.movement_type) ? quantity : -quantity;
          return { ...movement, balance: Number(balance.toFixed(6)) };
        });
      });
  },

  findByProduct(user_id: string, productId: string) {
    const movements = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];
        return StockMovement.find({ tenant_id: tenantId, product_id: productId }).sort({ created_at: -1 });
      });

    return movements;
  },

  findById(id: string) {
    return StockMovement.findById(id);
  },

  create(data: StockMovementDTO) {
    return StockMovement.create(data);
  },

  createMany(dataArray: StockMovementDTO[]) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return Promise.resolve([]);
    }
    return StockMovement.insertMany(dataArray);
  },

  update(id: string, data: StockMovementDTO) {
    return StockMovement.findByIdAndUpdate(id, data, { new: true });
  },

  delete(id: string) {
    return StockMovement.findByIdAndDelete(id);
  }
};

