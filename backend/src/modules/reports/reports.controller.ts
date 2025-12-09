export { }; // Empty export to force module scope

const service = require("./reports.service");
const { ok, fail } = require("../../shared/utils/response");

function parseFilters(query: any) {
  const filters: any = {};
  if (query.startDate) filters.startDate = new Date(query.startDate);
  if (query.endDate) filters.endDate = new Date(query.endDate);
  if (query.warehouseId) filters.warehouseId = query.warehouseId;
  if (query.categoryId) filters.categoryId = query.categoryId;
  return filters;
}

async function getDashboardStats(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query);
    const data = await service.getDashboardStats(req?.user?.id, filters);
    if (!data) return fail(res, "No data available", "NOT_FOUND", 404);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getDashboardStats:", error);
    return fail(res, "Failed to get dashboard stats", "INTERNAL_ERROR", 500);
  }
}

async function getSalesSummary(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query);
    const data = await service.getSalesSummary(req?.user?.id, filters);
    if (!data) return fail(res, "No data available", "NOT_FOUND", 404);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getSalesSummary:", error);
    return fail(res, "Failed to get sales summary", "INTERNAL_ERROR", 500);
  }
}

async function getPurchasesSummary(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query);
    const data = await service.getPurchasesSummary(req?.user?.id, filters);
    if (!data) return fail(res, "No data available", "NOT_FOUND", 404);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getPurchasesSummary:", error);
    return fail(res, "Failed to get purchases summary", "INTERNAL_ERROR", 500);
  }
}

async function getTopProducts(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query);
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await service.getTopProducts(req?.user?.id, limit, filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getTopProducts:", error);
    return fail(res, "Failed to get top products", "INTERNAL_ERROR", 500);
  }
}

async function getTopCategories(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query);
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await service.getTopCategories(req?.user?.id, limit, filters);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getTopCategories:", error);
    return fail(res, "Failed to get top categories", "INTERNAL_ERROR", 500);
  }
}

async function getLowStockProducts(req: Req, res: Res) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await service.getLowStockProducts(req?.user?.id, limit);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getLowStockProducts:", error);
    return fail(res, "Failed to get low stock products", "INTERNAL_ERROR", 500);
  }
}

async function getFinancialSummary(req: Req, res: Res) {
  try {
    const filters = parseFilters(req.query);
    const data = await service.getFinancialSummary(req?.user?.id, filters);
    if (!data) return fail(res, "No data available", "NOT_FOUND", 404);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getFinancialSummary:", error);
    return fail(res, "Failed to get financial summary", "INTERNAL_ERROR", 500);
  }
}

async function getSalesByPeriod(req: Req, res: Res) {
  try {
    const period = (req.query.period as 'day' | 'week' | 'month') || 'day';
    const limit = parseInt(req.query.limit as string) || 30;
    const data = await service.getSalesByPeriod(req?.user?.id, period, limit);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getSalesByPeriod:", error);
    return fail(res, "Failed to get sales by period", "INTERNAL_ERROR", 500);
  }
}

async function getRecentSales(req: Req, res: Res) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await service.getRecentSales(req?.user?.id, limit);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getRecentSales:", error);
    return fail(res, "Failed to get recent sales", "INTERNAL_ERROR", 500);
  }
}

async function getRecentPurchases(req: Req, res: Res) {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const data = await service.getRecentPurchases(req?.user?.id, limit);
    return ok(res, data);
  } catch (error) {
    console.error("Error in getRecentPurchases:", error);
    return fail(res, "Failed to get recent purchases", "INTERNAL_ERROR", 500);
  }
}

module.exports = {
  getDashboardStats,
  getSalesSummary,
  getPurchasesSummary,
  getTopProducts,
  getTopCategories,
  getLowStockProducts,
  getFinancialSummary,
  getSalesByPeriod,
  getRecentSales,
  getRecentPurchases
};

