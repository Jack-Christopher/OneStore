export { }; // Empty export to force module scope

import { toSnakeCase } from "@/shared/utils/object";
import { CreateTenantDTO, CreateManagerDTO, UpdateTenantStatusDTO } from "./admin.types";

const Tenant = require("../../database/models/Tenant");
const User = require("../../database/models/User");
const bcrypt = require("bcryptjs");

module.exports = {
  async createTenant(dto: CreateTenantDTO, createdBy: string) {
    const existingTenant = await Tenant.findOne({ document_number: dto.document_number });
    if (existingTenant && dto.document_number) {
      return {
        ok: false,
        message: "Tenant with this document number already exists",
        status: 400
      };
    }

    const tenantData = { ...dto, created_by: createdBy };
    const tenant = await Tenant.create(toSnakeCase(tenantData));

    return {
      ok: true,
      data: tenant
    };
  },

  async getAllTenants() {
    const tenants = await Tenant.find({}).sort({ created_at: -1 });
    return {
      ok: true,
      data: tenants
    };
  },

  async createManager(dto: CreateManagerDTO, createdBy: string) {
    const existingUser = await User.findOne({ email: dto.email });
    if (existingUser) {
      return {
        ok: false,
        message: "User with this email already exists",
        status: 400
      };
    }

    const tenant = await Tenant.findById(dto.tenant_id);
    if (!tenant) {
      return {
        ok: false,
        message: "Tenant not found",
        status: 404
      };
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const userData = {
      tenant_id: dto.tenant_id,
      email: dto.email,
      password: hashed,
      full_name: dto.full_name || null,
      role: "manager",
      is_active: true,
      created_by: createdBy
    };

    const user = await User.create(toSnakeCase(userData));

    return {
      ok: true,
      data: user
    };
  },

  async getManagers() {
    const managers = await User.find({ role: "manager" }).sort({ created_at: -1 });
    if (!managers) {
      return {
        ok: false,
        message: "No managers found",
        status: 404
      };
    }
    return {
      ok: true,
      data: managers
    };
  },

  async updateTenantStatus(tenantId: string, dto: UpdateTenantStatusDTO) {
    const tenant = await Tenant.findByIdAndUpdate(
      tenantId,
      { is_active: dto.is_active },
      { new: true }
    );

    if (!tenant) {
      return {
        ok: false,
        message: "Tenant not found",
        status: 404
      };
    }

    return {
      ok: true,
      data: tenant
    };
  }
};

