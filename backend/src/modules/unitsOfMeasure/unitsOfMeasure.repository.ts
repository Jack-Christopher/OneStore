import { UnitOfMeasureDTO } from '../unitsOfMeasure/unitsOfMeasure.types';

const UnitOfMeasure = require("../../database/models/UnitOfMeasure");
const User = require("../../database/models/User");

module.exports = {
  findAll(user_id: string) {
    const unitsOfMeasure = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        console.log("user", user);
        const tenantId = user.tenant_id;
        console.log(tenantId);

        if (tenantId == "orphan") return [];
        return UnitOfMeasure.find({ tenant_id: tenantId });
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
