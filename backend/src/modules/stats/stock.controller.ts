export { }; // Empty export to force module scope

const service = require("./stock.service");
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
  
  return filters;
}

async function getStockValue(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getStockValue(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getStockValue:", error);
    return fail(res, "Failed to get stock value", "INTERNAL_ERROR", 500);
  }
}

async function getMovementTypesFrequency(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getMovementTypesFrequency(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getMovementTypesFrequency:", error);
    return fail(res, "Failed to get movement types frequency", "INTERNAL_ERROR", 500);
  }
}

async function getInventoryEvolution(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    filters.product_id = req.query.product_id as string;
    const data = await service.getInventoryEvolution(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getInventoryEvolution:", error);
    return fail(res, "Failed to get inventory evolution", "INTERNAL_ERROR", 500);
  }
}

async function getUserActivity(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getUserActivity(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getUserActivity:", error);
    return fail(res, "Failed to get user activity", "INTERNAL_ERROR", 500);
  }
}

async function getOperationsActivity(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getOperationsActivity(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getOperationsActivity:", error);
    return fail(res, "Failed to get operations activity", "INTERNAL_ERROR", 500);
  }
}

async function getOperationsByDate(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query, req.user);
    const data = await service.getOperationsByDate(filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getOperationsByDate:", error);
    return fail(res, "Failed to get operations by date", "INTERNAL_ERROR", 500);
  }
}

module.exports = {
  getStockValue,
  getMovementTypesFrequency,
  getInventoryEvolution,
  getUserActivity,
  getOperationsActivity,
  getOperationsByDate
};

