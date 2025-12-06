import { WarehouseDTO } from '../warehouses/warehouses.types';

const Warehouse = require("../../database/models/Warehouse");
const User = require("../../database/models/User");

module.exports = {
  findAll(user_id: string) {
    const warehouses = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];
        return Warehouse.find({ tenant_id: tenantId });
      });

    return warehouses;
  },

  findById(id: string) {
    return Warehouse.findById(id);
  },

  create(data: WarehouseDTO) {
    return Warehouse.create(data);
  },

  update(id: string, data: WarehouseDTO) {
    return Warehouse.findByIdAndUpdate(id, data, { new: true });
  },

  delete(id: string) {
    return Warehouse.findByIdAndDelete(id);
  }
};

