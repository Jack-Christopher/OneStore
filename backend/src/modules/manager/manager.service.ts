export { }; // Empty export to force module scope

import { toSnakeCase } from "@/shared/utils/object";
import { CreateClerkDTO, UpdateUserDTO } from "./manager.types";

const User = require("../../database/models/User");
const bcrypt = require("bcryptjs");

module.exports = {
  async createClerk(dto: CreateClerkDTO, tenantId: string, createdBy: string) {
    const existingUser = await User.findOne({ email: dto.email });
    if (existingUser) {
      return {
        ok: false,
        message: "User with this email already exists",
        status: 400
      };
    }

    const existingUsername = await User.findOne({ tenant_id: tenantId, username: dto.username });
    if (existingUsername) {
      return {
        ok: false,
        message: "Username already exists in this tenant",
        status: 400
      };
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const userData = {
      tenant_id: tenantId,
      username: dto.username,
      email: dto.email,
      password: hashed,
      full_name: dto.full_name || null,
      role: "clerk",
      is_active: true,
      created_by: createdBy
    };

    const user = await User.create(toSnakeCase(userData));

    return {
      ok: true,
      data: user
    };
  },

  async getAllUsers(tenantId: string) {
    const users = await User.find({ tenant_id: tenantId })
      .select("-password")
      .sort({ created_at: -1 });

    return {
      ok: true,
      data: users
    };
  },

  async updateUser(userId: string, tenantId: string, dto: UpdateUserDTO, updatedBy: string) {
    const user = await User.findById(userId);
    if (!user) {
      return {
        ok: false,
        message: "User not found",
        status: 404
      };
    }

    if (user.tenant_id !== tenantId) {
      return {
        ok: false,
        message: "Forbidden: User does not belong to your tenant",
        status: 403
      };
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser = await User.findOne({ email: dto.email });
      if (existingUser) {
        return {
          ok: false,
          message: "User with this email already exists",
          status: 400
        };
      }
    }

    if (dto.username && dto.username !== user.username) {
      const existingUsername = await User.findOne({ tenant_id: tenantId, username: dto.username });
      if (existingUsername) {
        return {
          ok: false,
          message: "Username already exists in this tenant",
          status: 400
        };
      }
    }

    const updateData = { ...dto, updated_by: updatedBy };
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      toSnakeCase(updateData),
      { new: true }
    ).select("-password");

    return {
      ok: true,
      data: updatedUser
    };
  },

  async deleteUser(userId: string, tenantId: string) {
    const user = await User.findById(userId);
    if (!user) {
      return {
        ok: false,
        message: "User not found",
        status: 404
      };
    }

    if (user.tenant_id !== tenantId) {
      return {
        ok: false,
        message: "Forbidden: User does not belong to your tenant",
        status: 403
      };
    }

    if (user.role === "manager") {
      return {
        ok: false,
        message: "Cannot delete manager users",
        status: 403
      };
    }

    await User.findByIdAndDelete(userId);

    return {
      ok: true,
      data: { message: "User deleted successfully" }
    };
  }
};

