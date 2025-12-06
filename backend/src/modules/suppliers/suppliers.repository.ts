import { SupplierDTO } from '../suppliers/suppliers.types';

const Supplier = require("../../database/models/Supplier");
const User = require("../../database/models/User");

module.exports = {
  findAll(user_id: string) {
    const suppliers = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];
        return Supplier.find({ tenant_id: tenantId });
      });

    return suppliers;
  },

  findById(id: string) {
    return Supplier.findById(id);
  },

  create(data: SupplierDTO) {
    return Supplier.create(data);
  },

  update(id: string, data: SupplierDTO) {
    return Supplier.findByIdAndUpdate(id, data, { new: true });
  },

  delete(id: string) {
    return Supplier.findByIdAndDelete(id);
  }
};

