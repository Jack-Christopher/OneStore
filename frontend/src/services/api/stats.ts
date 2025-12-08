import api from "../lib/axios";
import type { ApiResponse } from "@/types/api";

export interface SalesSummary {
  totalSales: number;
  totalAmount: number;
  averageAmount: number;
}

export interface SalesByDay {
  date: string;
  totalSales: number;
  totalAmount: number;
}

export interface SalesByMonth {
  month: string;
  totalSales: number;
  totalAmount: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalAmount: number;
}

export interface PurchasesSummary {
  totalOrders: number;
  pendingOrders: number;
  receivedOrders: number;
  canceledOrders: number;
  totalAmount: number;
}

export interface PurchasesByMonth {
  month: string;
  totalOrders: number;
  totalAmount: number;
}

export interface ProductsAddedByMonth {
  month: string;
  totalProducts: number;
}

export interface LowStockProduct {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
}

export interface StockValue {
  totalValue: number;
  byCategory: Array<{
    categoryName: string;
    value: number;
  }>;
}

export interface UserCount {
  total: number;
  byRole: {
    admin?: number;
    manager?: number;
    clerk?: number;
  };
}

export interface DashboardOverview {
  // Ventas
  total_sales_amount: number;
  total_sales_count: number;
  average_ticket: number;
  comparison_vs_last_month: number;
  sales_by_day: SalesByDay[];
  top_selling_products: TopProduct[];
  last_month_sales_amount?: number;
  last_month_sales_count?: number;
  last_month_average_ticket?: number;
  
  // Compras
  total_purchases_amount: number;
  purchases_by_month: PurchasesByMonth[];
  average_cost_per_day: number;
  
  // Stock
  stock_value: number;
  low_stock_products: LowStockProduct[];
  stock_rotation: number;
  
  // Productos
  new_products_month: number;
  products_active: number;
  products_inactive: number;
  
  // Usuarios
  active_employees: number;
  new_employees_month: number;
}

export interface StatsFilters {
  tenant_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

const STATS_API_BASE = "/api/stats";

// Sales endpoints
export const getSalesSummary = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const res = await api.get<ApiResponse<SalesSummary>>(`${STATS_API_BASE}/sales/summary?${params}`);
  return res.data;
};

export const getSalesByDay = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const res = await api.get<ApiResponse<SalesByDay[]>>(`${STATS_API_BASE}/sales/by-day?${params}`);
  return res.data;
};

export const getSalesByMonth = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const res = await api.get<ApiResponse<SalesByMonth[]>>(`${STATS_API_BASE}/sales/by-month?${params}`);
  return res.data;
};

export const getTopProducts = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const res = await api.get<ApiResponse<TopProduct[]>>(`${STATS_API_BASE}/sales/top-products?${params}`);
  return res.data;
};

// Purchases endpoints
export const getPurchasesSummary = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  const res = await api.get<ApiResponse<PurchasesSummary>>(`${STATS_API_BASE}/purchases/summary?${params}`);
  return res.data;
};

export const getPurchasesByMonth = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const res = await api.get<ApiResponse<PurchasesByMonth[]>>(`${STATS_API_BASE}/purchases/by-month?${params}`);
  return res.data;
};

// Products endpoints
export const getProductsAddedByMonth = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const res = await api.get<ApiResponse<ProductsAddedByMonth[]>>(`${STATS_API_BASE}/products/added-by-month?${params}`);
  return res.data;
};

export const getLowStockProducts = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const res = await api.get<ApiResponse<LowStockProduct[]>>(`${STATS_API_BASE}/products/low-stock?${params}`);
  return res.data;
};

// Stock endpoints
export const getStockValue = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);

  const res = await api.get<ApiResponse<StockValue>>(`${STATS_API_BASE}/products/stock-value?${params}`);
  return res.data;
};

// Users endpoints
export const getUserCount = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);

  const res = await api.get<ApiResponse<UserCount>>(`${STATS_API_BASE}/users/count?${params}`);
  return res.data;
};

// Overview endpoint
export const getDashboardOverview = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);

  const res = await api.get<ApiResponse<DashboardOverview>>(`${STATS_API_BASE}/overview/dashboard?${params}`);
  return res.data;
};

// Additional interfaces for new charts
export interface SalesByPaymentMethod {
  paymentMethod: string;
  totalAmount: number;
  count: number;
}

export interface SalesByHour {
  hour: number;
  totalAmount: number;
  count: number;
}

export interface AverageTicketByDay {
  date: string;
  averageTicket: number;
  totalSales: number;
}

export interface SalesByWarehouse {
  warehouseId: string;
  warehouseName: string;
  totalAmount: number;
  count: number;
}

export interface TopCustomer {
  customerDocument: string;
  customerName: string;
  totalAmount: number;
  purchaseCount: number;
}

export interface SalesByCategory {
  categoryId: string;
  categoryName: string;
  totalQuantity: number;
  totalAmount: number;
}

export interface ProductMargin {
  productId: string;
  productName: string;
  purchasePrice: number;
  salePrice: number;
  margin: number;
  marginPercent: number;
}

export interface PurchasesBySupplier {
  supplierId: string;
  supplierName: string;
  totalAmount: number;
  orderCount: number;
}

export interface MovementTypeFrequency {
  movementType: string;
  count: number;
  totalQuantity: number;
}

export interface InventoryEvolution {
  date: string;
  stock: number;
  movement: number;
  type: string;
}

export interface UserActivity {
  userId: string;
  dayOfWeek: number;
  hour: number;
  count: number;
}

export interface MonthComparison {
  month: string;
  totalAmount: number;
  totalSales: number;
  averageTicket: number;
}

// New API endpoints
export const getSalesByPaymentMethod = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  const res = await api.get<ApiResponse<SalesByPaymentMethod[]>>(`${STATS_API_BASE}/sales/by-payment-method?${params}`);
  return res.data;
};

export const getSalesByHour = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  const res = await api.get<ApiResponse<SalesByHour[]>>(`${STATS_API_BASE}/sales/by-hour?${params}`);
  return res.data;
};

export const getAverageTicketByDay = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const res = await api.get<ApiResponse<AverageTicketByDay[]>>(`${STATS_API_BASE}/sales/average-ticket-by-day?${params}`);
  return res.data;
};

export const getSalesByWarehouse = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  const res = await api.get<ApiResponse<SalesByWarehouse[]>>(`${STATS_API_BASE}/sales/by-warehouse?${params}`);
  return res.data;
};

export const getTopCustomers = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const res = await api.get<ApiResponse<TopCustomer[]>>(`${STATS_API_BASE}/sales/top-customers?${params}`);
  return res.data;
};

export const getSalesByCategory = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  const res = await api.get<ApiResponse<SalesByCategory[]>>(`${STATS_API_BASE}/sales/by-category?${params}`);
  return res.data;
};

export const getProductMargins = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const res = await api.get<ApiResponse<ProductMargin[]>>(`${STATS_API_BASE}/sales/product-margins?${params}`);
  return res.data;
};

export const getPurchasesBySupplier = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  const res = await api.get<ApiResponse<PurchasesBySupplier[]>>(`${STATS_API_BASE}/purchases/by-supplier?${params}`);
  return res.data;
};

export const getMovementTypesFrequency = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  const res = await api.get<ApiResponse<MovementTypeFrequency[]>>(`${STATS_API_BASE}/stock/movement-types-frequency?${params}`);
  return res.data;
};

export const getInventoryEvolution = async (productId: string, filters?: StatsFilters) => {
  const params = new URLSearchParams();
  params.append('product_id', productId);
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  const res = await api.get<ApiResponse<InventoryEvolution[]>>(`${STATS_API_BASE}/stock/inventory-evolution?${params}`);
  return res.data;
};

export const getUserActivity = async (filters?: StatsFilters) => {
  const params = new URLSearchParams();
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);

  const res = await api.get<ApiResponse<UserActivity[]>>(`${STATS_API_BASE}/stock/user-activity?${params}`);
  return res.data;
};

