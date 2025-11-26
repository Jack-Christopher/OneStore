import { UnitOfMeasureDTO } from '../unitsOfMeasure/unitsOfMeasure.types';

const UnitOfMeasure = require("../../database/models/UnitOfMeasure");
const User = require("../../database/models/User");

module.exports = {
  findAll(user_id: string) {
    const unitsOfMeasure = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];
        return UnitOfMeasure.find({
          $or: [
            { tenant_id: tenantId },
            { tenant_id: "default" }
          ]
        });
      });

    return unitsOfMeasure;
  },

  findById(id: string) {
    return UnitOfMeasure.findById(id);
  },

  create(data: UnitOfMeasureDTO) {
    return UnitOfMeasure.create(data);
  },

  update(id: string, data: UnitOfMeasureDTO) {
    return UnitOfMeasure.findByIdAndUpdate(id, data, { new: true });
  },

  delete(id: string) {
    return UnitOfMeasure.findByIdAndDelete(id);
  }
};
