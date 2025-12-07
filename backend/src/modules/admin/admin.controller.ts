export { }; // Empty export to force module scope

const service = require("./admin.service");
const { ok, fail } = require("../../shared/utils/response");

async function createTenant(req: Req, res: Res) {
  const result = await service.createTenant(req.body, req.user.id);
  if (!result.ok) {
    return fail(res, result.message, "BAD_REQUEST", result.status);
  }
  return ok(res, result.data);
}

async function getAllTenants(req: Req, res: Res) {
  const result = await service.getAllTenants();
  if (!result.ok) {
    return fail(res, result.message || "Failed to fetch tenants", "INTERNAL_ERROR", result.status || 500);
  }
  return ok(res, result.data);
}

async function createManager(req: Req, res: Res) {
  const result = await service.createManager(req.body, req.user.id);
  if (!result.ok) {
    return fail(res, result.message, "BAD_REQUEST", result.status);
  }
  return ok(res, result.data);
}

async function getManagers(req: Req, res: Res) {
  const result = await service.getManagers();
  if (!result.ok) {
    return fail(res, result.message, "BAD_REQUEST", result.status);
  }
  return ok(res, result.data);
}

async function updateTenantStatus(req: Req, res: Res) {
  const result = await service.updateTenantStatus(req.params.id, req.body);
  if (!result.ok) {
    return fail(res, result.message, "NOT_FOUND", result.status);
  }
  return ok(res, result.data);
}

module.exports = {
  createTenant,
  getAllTenants,
  createManager,
  getManagers,
  updateTenantStatus
};

