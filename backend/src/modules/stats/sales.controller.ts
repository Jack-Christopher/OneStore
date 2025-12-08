export { }; // Empty export to force module scope

const service = require("./sales.service");
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
    return fail(res, "Failed to get sales summary", "INTERNAL_ERROR", 500);
  }
}

async function getByDay(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getByDay(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getByDay:", error);
    return fail(res, "Failed to get sales by day", "INTERNAL_ERROR", 500);
  }
}

async function getByMonth(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getByMonth(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getByMonth:", error);
    return fail(res, "Failed to get sales by month", "INTERNAL_ERROR", 500);
  }
}

async function getTopProducts(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getTopProducts(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getTopProducts:", error);
    return fail(res, "Failed to get top products", "INTERNAL_ERROR", 500);
  }
}

async function getByPaymentMethod(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getByPaymentMethod(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getByPaymentMethod:", error);
    return fail(res, "Failed to get sales by payment method", "INTERNAL_ERROR", 500);
  }
}

async function getByHour(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getByHour(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getByHour:", error);
    return fail(res, "Failed to get sales by hour", "INTERNAL_ERROR", 500);
  }
}

async function getAverageTicketByDay(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getAverageTicketByDay(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getAverageTicketByDay:", error);
    return fail(res, "Failed to get average ticket by day", "INTERNAL_ERROR", 500);
  }
}

async function getByWarehouse(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getByWarehouse(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getByWarehouse:", error);
    return fail(res, "Failed to get sales by warehouse", "INTERNAL_ERROR", 500);
  }
}

async function getTopCustomers(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getTopCustomers(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getTopCustomers:", error);
    return fail(res, "Failed to get top customers", "INTERNAL_ERROR", 500);
  }
}

async function getSalesByCategory(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getSalesByCategory(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getSalesByCategory:", error);
    return fail(res, "Failed to get sales by category", "INTERNAL_ERROR", 500);
  }
}

async function getProductMargins(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getProductMargins(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getProductMargins:", error);
    return fail(res, "Failed to get product margins", "INTERNAL_ERROR", 500);
  }
}

module.exports = {
  getSummary,
  getByDay,
  getByMonth,
  getTopProducts,
  getByPaymentMethod,
  getByHour,
  getAverageTicketByDay,
  getByWarehouse,
  getTopCustomers,
  getSalesByCategory,
  getProductMargins
};

