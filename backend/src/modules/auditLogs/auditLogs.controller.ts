export { }; // Empty export to force module scope

const repository = require("./auditLogs.repository");
const { ok, fail } = require("../../shared/utils/response");

async function listAuditLogs(req: Req, res: Res) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const filters: any = {};
    const userRole = req.user?.role;
    const userTenantId = String(req.user?.tenant_id || "");
    const userId = String(req.user?.id || "");

    // Enforce tenant filtering based on user role
    // Always use req.user.tenant_id (set by middleware) to prevent query manipulation
    if (userRole === "admin") {
      // Admin can optionally filter by tenant_id from query
      if (req.query.tenant_id) {
        filters.tenant_id = String(req.query.tenant_id);
      }
    } else if (userRole === "manager" || userRole === "clerk") {
      // Manager and Clerk: MUST filter by their own tenant_id (cannot be overridden)
      if (!userTenantId || userTenantId === "") {
        return fail(res, "User tenant not found", "UNAUTHORIZED", 401);
      }
      filters.tenant_id = userTenantId;
    } else {
      return fail(res, "Forbidden: Insufficient permissions", "FORBIDDEN", 403);
    }

    // User filtering: only clerks are restricted to their own logs
    if (userRole === "clerk") {
      if (!userId || userId === "") {
        return fail(res, "User ID not found", "UNAUTHORIZED", 401);
      }
      filters.user_id = userId;
    } else if (userRole === "admin" || userRole === "manager") {
      // Admin and Manager can optionally filter by user_id from query
      if (req.query.user_id) {
        filters.user_id = String(req.query.user_id);
      }
    }

    // Apply optional filters
    if (req.query.entity) {
      filters.entity = req.query.entity;
    }

    if (req.query.action) {
      filters.action = req.query.action;
    }

    if (req.query.date_from) {
      filters.date_from = req.query.date_from;
    }

    if (req.query.date_to) {
      filters.date_to = req.query.date_to;
    }

    const result = await repository.findAll(filters, page, limit);

    return ok(res, result);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Failed to fetch audit logs", "INTERNAL_ERROR", 500);
  }
}

async function getOne(req: Req, res: Res) {
  try {
    const log = await repository.findById(req.params.id);
    if (!log) return fail(res, "Audit log not found", "NOT_FOUND", 404);
    
    // Security check: ensure user can only access logs from their tenant
    const userRole = req.user?.role;
    const userTenantId = String(req.user?.tenant_id || "");
    const userId = String(req.user?.id || "");
    const logTenantId = String(log.tenant_id || "");
    const logUserId = String(log.user_id || "");
    
    if (userRole === "admin") {
      // Admin can access all logs
    } else if (userRole === "manager") {
      // Manager can only access logs from their tenant
      if (!userTenantId || logTenantId !== userTenantId) {
        return fail(res, "Forbidden: Cannot access audit log from another tenant", "FORBIDDEN", 403);
      }
    } else if (userRole === "clerk") {
      // Clerk can only access their own logs from their tenant
      if (!userTenantId || !userId || logTenantId !== userTenantId || logUserId !== userId) {
        return fail(res, "Forbidden: Cannot access audit log from another tenant or user", "FORBIDDEN", 403);
      }
    } else {
      return fail(res, "Forbidden: Insufficient permissions", "FORBIDDEN", 403);
    }
    
    return ok(res, log);
  } catch (error) {
    console.log(JSON.stringify(error, null, 2));
    return fail(res, "Failed to fetch audit log", "INTERNAL_ERROR", 500);
  }
}

module.exports = { listAuditLogs, getOne };

