export { }; // Empty export to force module scope

const service = require("./purchases.service");
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
  
  // Date filtering
  if (query.date_from) filters.date_from = new Date(query.date_from);
  if (query.date_to) filters.date_to = new Date(query.date_to);
  
  // Pagination
  filters.page = parseInt(query.page as string) || 1;
  filters.limit = parseInt(query.limit as string) || 10;
  
  return filters;
}

async function getSummary(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getSummary(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getSummary:", error);
    return fail(res, "Failed to get purchases summary", "INTERNAL_ERROR", 500);
  }
}

async function getByMonth(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getByMonth(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getByMonth:", error);
    return fail(res, "Failed to get purchases by month", "INTERNAL_ERROR", 500);
  }
}

async function getBySupplier(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getBySupplier(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getBySupplier:", error);
    return fail(res, "Failed to get purchases by supplier", "INTERNAL_ERROR", 500);
  }
}

async function getPurchasesActivity(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getPurchasesActivity(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getPurchasesActivity:", error);
    return fail(res, "Failed to get purchases activity", "INTERNAL_ERROR", 500);
  }
}

async function getPurchasesByDate(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getPurchasesByDate(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getPurchasesByDate:", error);
    return fail(res, "Failed to get purchases by date", "INTERNAL_ERROR", 500);
  }
}

module.exports = {
  getSummary,
  getByMonth,
  getBySupplier,
  getPurchasesActivity,
  getPurchasesByDate
};

