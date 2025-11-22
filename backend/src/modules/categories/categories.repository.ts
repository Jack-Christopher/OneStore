import { CategoryDTO } from '../categories/categories.types';

const Category = require("../../database/models/Category");

module.exports = {
  findAll() {
    return Category.find();
  },

  findById(id: string) {
    return Category.findById(id);
  },

  create(data: CategoryDTO) {
    console.log("Creating category with data in repository:", data);
    return Category.create(data);
  },

  update(id: string, data: CategoryDTO) {
    return Category.findByIdAndUpdate(id, data, { new: true });
  },

  delete(id: string) {
    return Category.findByIdAndDelete(id);
  }
};
