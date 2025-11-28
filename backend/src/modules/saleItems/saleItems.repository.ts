import { SaleItemDTO } from '../saleItems/saleItems.types';

const SaleItem = require("../../database/models/SaleItem");
const User = require("../../database/models/User");
const Sale = require("../../database/models/Sale");

module.exports = {
  // ToDo: move this logic to service layer
  findAll(user_id: string) {
    const saleItems = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];
        return SaleItem.find({ tenant_id: tenantId });
      });

    return saleItems;
  },

  findAllBySaleId(sale_id: string) {
    const saleItems = Sale.findOne({ _id: sale_id }).exec()
      .then((sale: any) => {
        const saleId = sale._id;

        return SaleItem.find({ sale_id: saleId });
      });

    return saleItems;
  },

  findById(id: string) {
    return SaleItem.findById(id);
  },

  create(data: SaleItemDTO) {
    return SaleItem.create(data);
  },

  createMany(dataArray: SaleItemDTO[]) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return Promise.resolve([]);
    }

    const insertPromise = SaleItem.insertMany(dataArray);

    return insertPromise.then((insertedDocs: SaleItemDTO[]) => {
      console.log(`Successfully inserted ${insertedDocs.length} items`);
      return insertedDocs;
    }).catch((error: any) => {
      console.error("Error during bulk insertion in .catch():", error);
      throw error;
    });


  },

  update(id: string, data: SaleItemDTO) {
    return SaleItem.findByIdAndUpdate(id, data, { new: true });
  },

  delete(id: string) {
    return SaleItem.findByIdAndDelete(id);
  }
};
