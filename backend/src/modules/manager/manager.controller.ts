export { }; // Empty export to force module scope

const service = require("./manager.service");
const { ok, fail } = require("../../shared/utils/response");

async function createClerk(req: Req, res: Res) {
  const tenantId = req.user.tenant_id;
  const result = await service.createClerk(req.body, tenantId, req.user.id);
  if (!result.ok) {
    return fail(res, result.message, "BAD_REQUEST", result.status);
  }
  return ok(res, result.data);
}

async function getAllUsers(req: Req, res: Res) {
  const tenantId = req.user.tenant_id;
  const result = await service.getAllUsers(tenantId);
  if (!result.ok) {
    return fail(res, result.message || "Failed to fetch users", "INTERNAL_ERROR", result.status || 500);
  }
  return ok(res, result.data);
}

async function updateUser(req: Req, res: Res) {
  const tenantId = req.user.tenant_id;
  const result = await service.updateUser(req.params.id, tenantId, req.body, req.user.id);
  if (!result.ok) {
    return fail(res, result.message, "BAD_REQUEST", result.status);
  }
  return ok(res, result.data);
}

async function deleteUser(req: Req, res: Res) {
  const tenantId = req.user.tenant_id;
  const result = await service.deleteUser(req.params.id, tenantId);
  if (!result.ok) {
    return fail(res, result.message, "BAD_REQUEST", result.status);
  }
  return ok(res, result.data);
}

module.exports = {
  createClerk,
  getAllUsers,
  updateUser,
  deleteUser
};

