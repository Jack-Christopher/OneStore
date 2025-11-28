import { SaleDTO } from '../sales/sales.types';

const Sale = require("../../database/models/Sale");
const User = require("../../database/models/User");

module.exports = {
  // ToDo: move this logic to service layer
  findAll(user_id: string) {
    const sales = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];
        return Sale.find({ tenant_id: tenantId });
      });

    return sales;
  },

  findById(id: string) {
    return Sale.findById(id);
  },

  create(data: SaleDTO) {
    return Sale.create(data);
  },

  update(id: string, data: SaleDTO) {
    return Sale.findByIdAndUpdate(id, data, { new: true });
  },

  delete(id: string) {
    return Sale.findByIdAndDelete(id);
  }
};
