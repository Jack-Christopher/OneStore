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
  const filters = parseFilters(req.query);
  const data = await service.getDashboardStats(req?.user?.id, filters);
  if (!data) return fail(res, "No data available", 404);
  return ok(res, data);
}

async function getSalesSummary(req: Req, res: Res) {
  const filters = parseFilters(req.query);
  const data = await service.getSalesSummary(req?.user?.id, filters);
  if (!data) return fail(res, "No data available", 404);
  return ok(res, data);
}

async function getPurchasesSummary(req: Req, res: Res) {
  const filters = parseFilters(req.query);
  const data = await service.getPurchasesSummary(req?.user?.id, filters);
  if (!data) return fail(res, "No data available", 404);
  return ok(res, data);
}

async function getTopProducts(req: Req, res: Res) {
  const filters = parseFilters(req.query);
  const limit = parseInt(req.query.limit as string) || 10;
  const data = await service.getTopProducts(req?.user?.id, limit, filters);
  return ok(res, data);
}

async function getTopCategories(req: Req, res: Res) {
  const filters = parseFilters(req.query);
  const limit = parseInt(req.query.limit as string) || 10;
  const data = await service.getTopCategories(req?.user?.id, limit, filters);
  return ok(res, data);
}

async function getLowStockProducts(req: Req, res: Res) {
  const limit = parseInt(req.query.limit as string) || 10;
  const data = await service.getLowStockProducts(req?.user?.id, limit);
  return ok(res, data);
}

async function getFinancialSummary(req: Req, res: Res) {
  const filters = parseFilters(req.query);
  const data = await service.getFinancialSummary(req?.user?.id, filters);
  if (!data) return fail(res, "No data available", 404);
  return ok(res, data);
}

async function getSalesByPeriod(req: Req, res: Res) {
  const period = (req.query.period as 'day' | 'week' | 'month') || 'day';
  const limit = parseInt(req.query.limit as string) || 30;
  const data = await service.getSalesByPeriod(req?.user?.id, period, limit);
  return ok(res, data);
}

async function getRecentSales(req: Req, res: Res) {
  const limit = parseInt(req.query.limit as string) || 10;
  const data = await service.getRecentSales(req?.user?.id, limit);
  return ok(res, data);
}

async function getRecentPurchases(req: Req, res: Res) {
  const limit = parseInt(req.query.limit as string) || 10;
  const data = await service.getRecentPurchases(req?.user?.id, limit);
  return ok(res, data);
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

