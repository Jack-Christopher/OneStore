const repo = require("./auth.repository");
const { hash, compare } = require("../../shared/utils/hash");
const jwt2 = require("jsonwebtoken");
const { jwtSecret: secret } = require("../../config/env");
import { LoginInput, RegisterInput } from "./auth.types";

module.exports = {
  register: async ({ email, password }: RegisterInput) => {
    const exists = await repo.findByEmail(email);
    if (exists) throw new Error("Email already used");
    const hashed = await hash(password);
    return repo.create({ email, password: hashed });
  },
  login: async ({ email, password }: LoginInput) => {
    const user = await repo.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");
    const match = await compare(password, user.password);
    if (!match) throw new Error("Invalid credentials");
    return jwt2.sign({ id: user._id }, secret, { expiresIn: "1d" });
  }
};