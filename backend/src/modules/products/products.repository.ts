import { ProductDTO } from '../products/products.types';

const Product = require("../../database/models/Product");

module.exports = {
  findAll() {
    return Product.find();
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
