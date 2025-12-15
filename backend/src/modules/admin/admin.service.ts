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

    try {
      const user = await User.create(toSnakeCase(userData));

      return {
        ok: true,
        data: user
      };
    } catch (error: any) {
      // Log MongoDB validation errors with full details
      if (error.name === 'MongoServerError' && error.code === 121) {
        console.error('=== Manager Creation Validation Error ===');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        console.error('Failing Document ID:', error.errInfo?.failingDocumentId);
        console.error('Error Details (JSON):');
        console.error(JSON.stringify(error.errInfo?.details, null, 2));
        console.error('Full errInfo (JSON):');
        console.error(JSON.stringify(error.errInfo, null, 2));
        console.error('Full errorResponse (JSON):');
        console.error(JSON.stringify(error.errorResponse, null, 2));
        console.error('User Data that failed validation (JSON):');
        console.error(JSON.stringify(toSnakeCase(userData), null, 2));
        console.error('========================================');
      }
      // Re-throw to be handled by the error handler middleware
      throw error;
    }
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

