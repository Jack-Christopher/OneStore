import { Product } from '../products/products.types';

module.exports.productsRepository = {
  findAll: () => [],
  create: (p: Product) => p
};