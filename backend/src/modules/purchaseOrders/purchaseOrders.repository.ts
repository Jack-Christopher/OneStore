import { PurchaseOrderDTO, PurchaseOrderItemDTO } from './purchaseOrders.types';

const PurchaseOrder = require("../../database/models/PurchaseOrder");
const PurchaseOrderItem = require("../../database/models/PurchaseOrderItem");
const User = require("../../database/models/User");

module.exports = {
  findAll(user_id: string) {
    const orders = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];
        return PurchaseOrder.find({ tenant_id: tenantId });
      });

    return orders;
  },

  findById(id: string) {
    return PurchaseOrder.findById(id);
  },

  create(data: PurchaseOrderDTO) {
    return PurchaseOrder.create(data);
  },

  update(id: string, data: PurchaseOrderDTO) {
    return PurchaseOrder.findByIdAndUpdate(id, data, { new: true });
  },

  delete(id: string) {
    return PurchaseOrder.findByIdAndDelete(id);
  },

  // Items
  findItemsByOrderId(orderId: string) {
    return PurchaseOrderItem.find({ purchase_order_id: orderId });
  },

  createItem(data: PurchaseOrderItemDTO) {
    return PurchaseOrderItem.create(data);
  },

  createManyItems(dataArray: PurchaseOrderItemDTO[]) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return Promise.resolve([]);
    }
    return PurchaseOrderItem.insertMany(dataArray);
  },

  updateItem(id: string, data: PurchaseOrderItemDTO) {
    return PurchaseOrderItem.findByIdAndUpdate(id, data, { new: true });
  },

  deleteItem(id: string) {
    return PurchaseOrderItem.findByIdAndDelete(id);
  },

  deleteItemsByOrderId(orderId: string) {
    return PurchaseOrderItem.deleteMany({ purchase_order_id: orderId });
  }
};

