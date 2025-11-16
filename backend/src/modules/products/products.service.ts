import { Product } from '../products/products.types';

module.exports.productsService = {
  list: () => module.exports.productsRepository.findAll(),
  create: (p: Product) => module.exports.productsRepository.create(p)
};