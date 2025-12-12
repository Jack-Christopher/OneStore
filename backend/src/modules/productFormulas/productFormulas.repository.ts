import { ProductFormulaDTO } from './productFormulas.types';

const ProductFormula = require("../../database/models/ProductFormula");
const User = require("../../database/models/User");

module.exports = {
  findAll(user_id: string) {
    const productFormulas = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];

        return ProductFormula.find({ tenant_id: tenantId })
          .populate("reference_unit_id", "name");
      });

    return productFormulas;
  },

  findById(id: string) {
    return ProductFormula.findById(id)
    .populate("items.product_id", "name")
    .populate("items.unit_id", "name")
    .populate("reference_unit_id", "name");
  },

  create(data: ProductFormulaDTO) {
    return ProductFormula.create(data);
  },

  update(id: string, data: ProductFormulaDTO) {
    return ProductFormula.findByIdAndUpdate(id, data, { new: true });
  },

  delete(id: string) {
    return ProductFormula.findByIdAndDelete(id);
  }
};
