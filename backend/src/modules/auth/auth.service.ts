import { toSnakeCase } from "@/shared/utils/object";
import { LoginDTO, RegisterDTO, UserDTO } from "./auth.types";
export { }; // Empty export to force module scope

const User = require("../../database/models/User")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { jwtSecret } = require("../../config/env")
const { AuthErrorCode } = require("./auth.errors")

module.exports = {
  async login({ email, password }: LoginDTO) {
    const user = await User.findOne({ email })
    if (!user) {
      return {
        ok: false,
        code: AuthErrorCode.EMAIL_NOT_FOUND,
        status: 404
      }
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return {
        ok: false,
        code: AuthErrorCode.INVALID_PASSWORD,
        status: 401
      }
    }

    const token = jwt.sign({ id: user.id, role: user.role, tenant_id: user.tenant_id }, jwtSecret, { expiresIn: "1d" })
    return {
      ok: true,
      data: {
        id: user.id,
        tenantId: user.tenant_id,
        role: user.role,
        fullname: user.full_name,
        email: user.email,
        isActive: user.is_active,
        token
      }
    }
  },

  async register({ fullname, email, password }: RegisterDTO) {
    const exists = await User.findOne({ email })
    if (exists) {
      return {
        ok: false,
        code: AuthErrorCode.EMAIL_ALREADY_EXISTS,
        status: 400
      }
    }

    const hashed = await bcrypt.hash(password, 10)
    const userData = { tenantId: "orphan", fullname, email, password: hashed, username: fullname };

    const user = await User.create(toSnakeCase(userData));

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: "1d" })

    return {
      ok: true,
      data: {
        id: user._id,
        name: user.fullname,
        email: user.email,
        token
      }
    }
  },

  async profile(userId: string) {
    const user = await User.findById(userId)
    if (!user) {
      return {
        ok: false,
        code: AuthErrorCode.UNAUTHORIZED,
        status: 401
      }
    }

    return {
      ok: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    }
  }
}
