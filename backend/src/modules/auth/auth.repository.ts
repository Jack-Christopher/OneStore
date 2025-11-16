import { RegisterDTO } from "./auth.types";

const User = require("../../database/models/User");

module.exports = {
  async findByEmail(email: string) {
    return User.findOne({ email });
  },

  async createUser(data: RegisterDTO) {
    return User.create(data);
  }
};