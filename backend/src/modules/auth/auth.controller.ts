export { }; // Empty export to force module scope

const service = require("./auth.service");
const { ok, fail } = require("../../shared/utils/response");
const { logAudit } = require("../../shared/services/audit.service");

async function login(req: Req, res: Res) {
  const result = await service.login(req.body);
  if (!result.ok) return fail(res, result.code.message, result.code.name, result.status);

  const { id, tenantId, role, fullname, email, rubro, isActive, token } = result.data;

  console.log("Login successful for user:", result.data);

  // Audit login
  await logAudit({
    tenant_id: tenantId || "orphan",
    user_id: id,
    action: "login",
    entity: "User",
    entity_id: id,
    old_data: null,
    new_data: { email, role }
  });

  return ok(res, ({
    user: {
      id: id,
      tenantId: tenantId,
      email: email,
      fullname: fullname,
      role: role,
      rubro: rubro,
      isActive: isActive
    },
    token: token
  }));
}

async function register(req: Req, res: Res) {
  const result = await service.register(req.body);

  if (!result.ok) return fail(res, result.code.message, result.code.name, result.status);

  const { id, email, name } = result.data;

  return ok(res, {
    id: id,
    email: email,
    name: name
  });
}

async function logout(req: Req, res: Res) {
  const user_id = req.user?.id;
  const tenant_id = req.user?.tenant_id || "orphan";

  // Audit logout
  if (user_id) {
    await logAudit({
      tenant_id: tenant_id,
      user_id: user_id,
      action: "logout",
      entity: "User",
      entity_id: user_id,
      old_data: null,
      new_data: null
    });
  }

  return ok(res, { message: "Logged out successfully" });
}

async function getProfile(req: Req, res: Res) {
  const userId = req?.user?.id;
  if (!userId) {
    return fail(res, "User not authenticated", "UNAUTHORIZED", 401);
  }

  const result = await service.profile(userId);
  if (!result.ok) {
    return fail(res, result.code.message, result.code.name, result.status);
  }

  const token = req.headers.authorization?.split(" ")[1] || "";

  return ok(res, {
    user: {
      id: result.data.id,
      tenantId: result.data.tenantId,
      email: result.data.email,
      fullname: result.data.fullname,
      role: result.data.role,
      rubro: result.data.rubro,
      isActive: result.data.isActive
    },
    token: token
  });
}

async function updateProfile(req: Req, res: Res) {
  const userId = req?.user?.id;
  if (!userId) {
    return fail(res, "User not authenticated", "UNAUTHORIZED", 401);
  }

  const oldUser = await service.profile(userId);
  const result = await service.updateProfile(userId, req.body);
  
  if (!result.ok) {
    return fail(res, result.code.message, result.code.name, result.status);
  }

  // Audit profile update
  await logAudit({
    tenant_id: result.data.tenantId || "orphan",
    user_id: userId,
    action: "update",
    entity: "User",
    entity_id: userId,
    old_data: oldUser.ok ? oldUser.data : null,
    new_data: result.data
  });

  const token = req.headers.authorization?.split(" ")[1] || "";

  return ok(res, {
    user: {
      id: result.data.id,
      tenantId: result.data.tenantId,
      email: result.data.email,
      fullname: result.data.fullname,
      role: result.data.role,
      rubro: result.data.rubro,
      isActive: result.data.isActive
    },
    token: token
  });
}

module.exports = { login, register, logout, getProfile, updateProfile }; 
