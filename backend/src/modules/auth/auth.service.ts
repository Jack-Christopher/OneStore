import { LoginDTO, RegisterDTO} from "./auth.types";
export {}; // Empty export to force module scope

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../../config/env");
const repo = require("./auth.repository");

async function login(dto: LoginDTO) {
  const user = await repo.findByEmail(dto.email);
  if (!user) return null;

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) return null;

  const token = jwt.sign({ id: user.id, email: user.email }, jwtSecret, { expiresIn: "7d" });

  return { user, token };
}

async function register(dto: RegisterDTO) {
  const exists = await repo.findByEmail(dto.email);
  if (exists) return null;

  const hashed = await bcrypt.hash(dto.password, 10);

  const user = await repo.createUser({
    name: dto.name,
    email: dto.email,
    password: hashed
  });

  return user;
}

module.exports = { login, register };
