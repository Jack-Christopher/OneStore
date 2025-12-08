export { }; // Empty export to force module scope

const service = require("./overview.service");
const { ok, fail } = require("../../shared/utils/response");

function parseFilters(query: any, user: any) {
  const filters: any = {};
  
  // Role-based filtering
  if (user.role === 'admin' && query.tenant_id) {
    filters.tenant_id = query.tenant_id;
  } else if (user.role === 'manager' || user.role === 'clerk') {
    filters.tenant_id = user.tenant_id;
  }
  
  // User-based filtering for clerks
  if (user.role === 'clerk') {
    filters.user_id = user.id;
  }
  
  return filters;
}

async function getDashboard(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getDashboard(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getDashboard:", error);
    return fail(res, "Failed to get dashboard overview", "INTERNAL_ERROR", 500);
  }
}

module.exports = {
  getDashboard
};

