export { }; // Empty export to force module scope

const repository = require("./auditLogs.repository");
const { ok, fail } = require("../../shared/utils/response");

async function listAuditLogs(req: Req, res: Res) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const filters: any = {};

    // Apply query filters (restrictAuditQuery middleware already applied tenant_id and user_id restrictions)
    if (req.query.tenant_id) {
      filters.tenant_id = req.query.tenant_id;
    }

    if (req.query.user_id) {
      filters.user_id = req.query.user_id;
    }

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
    const userTenantId = req.user?.tenant_id;
    const userId = req.user?.id;
    
    if (userRole === "admin") {
      // Admin can access all logs
    } else if (userRole === "manager") {
      // Manager can only access logs from their tenant
      if (log.tenant_id !== userTenantId) {
        return fail(res, "Forbidden: Cannot access audit log from another tenant", "FORBIDDEN", 403);
      }
    } else if (userRole === "clerk") {
      // Clerk can only access their own logs from their tenant
      if (log.tenant_id !== userTenantId || log.user_id !== userId) {
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

