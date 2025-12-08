export { }; // Empty export to force module scope

const service = require("./products.service");
const { ok, fail } = require("../../shared/utils/response");

function parseFilters(query: any, user: any) {
  const filters: any = {};
  
  // Role-based filtering
  if (user.role === 'admin' && query.tenant_id) {
    filters.tenant_id = query.tenant_id;
  } else if (user.role === 'manager' || user.role === 'clerk') {
    filters.tenant_id = user.tenant_id;
  }
  
  // Date filtering
  if (query.date_from) filters.date_from = new Date(query.date_from);
  if (query.date_to) filters.date_to = new Date(query.date_to);
  
  // Pagination
  filters.page = parseInt(query.page as string) || 1;
  filters.limit = parseInt(query.limit as string) || 10;
  
  return filters;
}

async function getAddedByMonth(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getAddedByMonth(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getAddedByMonth:", error);
    return fail(res, "Failed to get products added by month", "INTERNAL_ERROR", 500);
  }
}

async function getLowStock(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getLowStock(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getLowStock:", error);
    return fail(res, "Failed to get low stock products", "INTERNAL_ERROR", 500);
  }
}

module.exports = {
  getAddedByMonth,
  getLowStock
};

