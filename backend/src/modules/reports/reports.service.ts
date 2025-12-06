import { ReportFilters } from "./reports.types";

const repo = require("./reports.repository");
const User = require("../../database/models/User");

async function getTenantId(user_id: string): Promise<string | null> {
  const user = await User.findById(user_id);
  if (!user || user.tenant_id === "orphan") return null;
  return user.tenant_id;
}

async function getDashboardStats(user_id: string, filters?: ReportFilters) {
  const tenantId = await getTenantId(user_id);
  if (!tenantId) return null;

  const [
    salesSummary,
    purchasesSummary,
    financialSummary,
    topProducts,
    topCategories,
    lowStockProducts
  ] = await Promise.all([
    repo.getSalesSummary(tenantId, filters?.startDate, filters?.endDate),
    repo.getPurchasesSummary(tenantId, filters?.startDate, filters?.endDate),
    repo.getFinancialSummary(tenantId, filters?.startDate, filters?.endDate),
    repo.getTopProducts(tenantId, 10, filters?.startDate, filters?.endDate),
    repo.getTopCategories(tenantId, 10, filters?.startDate, filters?.endDate),
    repo.getLowStockProducts(tenantId, 10)
  ]);

  return {
    salesSummary,
    purchasesSummary,
    financialSummary,
    topProducts,
    topCategories,
    lowStockProducts
  };
}

async function getSalesSummary(user_id: string, filters?: ReportFilters) {
  const tenantId = await getTenantId(user_id);
  if (!tenantId) return null;
  return repo.getSalesSummary(tenantId, filters?.startDate, filters?.endDate);
}

async function getPurchasesSummary(user_id: string, filters?: ReportFilters) {
  const tenantId = await getTenantId(user_id);
  if (!tenantId) return null;
  return repo.getPurchasesSummary(tenantId, filters?.startDate, filters?.endDate);
}

async function getTopProducts(user_id: string, limit: number = 10, filters?: ReportFilters) {
  const tenantId = await getTenantId(user_id);
  if (!tenantId) return [];
  return repo.getTopProducts(tenantId, limit, filters?.startDate, filters?.endDate);
}

async function getTopCategories(user_id: string, limit: number = 10, filters?: ReportFilters) {
  const tenantId = await getTenantId(user_id);
  if (!tenantId) return [];
  return repo.getTopCategories(tenantId, limit, filters?.startDate, filters?.endDate);
}

async function getLowStockProducts(user_id: string, limit: number = 10) {
  const tenantId = await getTenantId(user_id);
  if (!tenantId) return [];
  return repo.getLowStockProducts(tenantId, limit);
}

async function getFinancialSummary(user_id: string, filters?: ReportFilters) {
  const tenantId = await getTenantId(user_id);
  if (!tenantId) return null;
  return repo.getFinancialSummary(tenantId, filters?.startDate, filters?.endDate);
}

async function getSalesByPeriod(user_id: string, period: 'day' | 'week' | 'month' = 'day', limit: number = 30) {
  const tenantId = await getTenantId(user_id);
  if (!tenantId) return [];
  return repo.getSalesByPeriod(tenantId, period, limit);
}

async function getRecentSales(user_id: string, limit: number = 10) {
  const tenantId = await getTenantId(user_id);
  if (!tenantId) return [];
  return repo.getRecentSales(tenantId, limit);
}

async function getRecentPurchases(user_id: string, limit: number = 10) {
  const tenantId = await getTenantId(user_id);
  if (!tenantId) return [];
  return repo.getRecentPurchases(tenantId, limit);
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

