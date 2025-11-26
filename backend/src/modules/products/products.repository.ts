import { ProductDTO } from '../products/products.types';

const Product = require("../../database/models/Product");
const User = require("../../database/models/User");

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

  findById(id: string) {
    return Product.findById(id);
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
