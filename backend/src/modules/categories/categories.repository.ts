import { CategoryDTO } from '../categories/categories.types';

const Category = require("../../database/models/Category");
const User = require("../../database/models/User");

module.exports = {
  // ToDo: move this logic to service layer
  findAll(user_id: string) {
    const categories = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];
        return Category.find({ tenant_id: tenantId });
      });

    return categories;
  },

  findById(id: string) {
    return Category.findById(id);
  },

  create(data: CategoryDTO) {
    return Category.create(data);
  },

  update(id: string, data: CategoryDTO) {
    return Category.findByIdAndUpdate(id, data, { new: true });
  },

  delete(id: string) {
    return Category.findByIdAndDelete(id);
  }
};
