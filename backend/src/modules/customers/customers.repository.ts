import { CustomerDTO } from '../customers/customers.types';

const Customer = require("../../database/models/Customer");
const User = require("../../database/models/User");

module.exports = {
  findAll(user_id: string) {
    const customers = User.findOne({ _id: user_id }).exec()
      .then((user: any) => {
        const tenantId = user.tenant_id;

        if (tenantId == "orphan") return [];
        return Customer.find({ tenant_id: tenantId });
      });

    return customers;
  },

  findById(id: string) {
    return Customer.findById(id);
  },

  create(data: CustomerDTO) {
    return Customer.create(data);
  },

  update(id: string, data: CustomerDTO) {
    return Customer.findByIdAndUpdate(id, data, { new: true });
  },

  delete(id: string) {
    return Customer.findByIdAndDelete(id);
  }
};

