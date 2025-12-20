import { create } from "zustand";
import {
  getSalesSummary,
  getSalesByDay,
  getSalesByMonth,
  getTopProducts,
  getSalesByPaymentMethod,
  getSalesByHour,
  getAverageTicketByDay,
  getSalesByWarehouse,
  getTopCustomers,
  getSalesByCategory,
  getProductMargins,
  getPurchasesSummary,
  getPurchasesByMonth,
  getPurchasesBySupplier,
  getProductsAddedByMonth,
  getLowStockProducts,
  getStockValue,
  getMovementTypesFrequency,
  getUserActivity,
  getSalesActivity,
  getPurchasesActivity,
  getOperationsActivity,
  getSalesByDate,
  getPurchasesByDate,
  getOperationsByDate,
  getUserCount,
  getDashboardOverview
} from "@/services/api/stats";
import type {
  SalesSummary,
  SalesByDay,
  SalesByMonth,
  TopProduct,
  LowStockProduct,
  ProductsAddedByMonth,
  StockValue,
  UserCount,
  DashboardOverview,
  SalesByPaymentMethod,
  SalesByHour,
  AverageTicketByDay,
  SalesByWarehouse,
  TopCustomer,
  SalesByCategory,
  ProductMargin,
  PurchasesSummary,
  PurchasesByMonth,
  PurchasesBySupplier,
  MovementTypeFrequency,
  UserActivity,
  ActivityHeatmap,
  ActivityByDate,
  StatsFilters
} from "@/services/api/stats";

interface StatsState {
  // Sales
  salesSummary: SalesSummary | null;
  salesByDay: SalesByDay[];
  salesByMonth: SalesByMonth[];
  topProducts: TopProduct[];
  salesByPaymentMethod: SalesByPaymentMethod[];
  salesByHour: SalesByHour[];
  averageTicketByDay: AverageTicketByDay[];
  salesByWarehouse: SalesByWarehouse[];
  topCustomers: TopCustomer[];
  salesByCategory: SalesByCategory[];
  productMargins: ProductMargin[];
  
  // Purchases
  purchasesSummary: PurchasesSummary | null;
  purchasesByMonth: PurchasesByMonth[];
  purchasesBySupplier: PurchasesBySupplier[];
  
  // Products
  productsAddedByMonth: ProductsAddedByMonth[];
  lowStockProducts: LowStockProduct[];
  
  // Stock
  stockValue: StockValue | null;
  movementTypesFrequency: MovementTypeFrequency[];
  userActivity: UserActivity[];
  salesActivity: ActivityHeatmap[];
  purchasesActivity: ActivityHeatmap[];
  operationsActivity: ActivityHeatmap[];
  salesByDate: ActivityByDate[];
  purchasesByDate: ActivityByDate[];
  operationsByDate: ActivityByDate[];
  
  // Users
  userCount: UserCount | null;
  
  // Overview
  dashboardOverview: DashboardOverview | null;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchSalesSummary: (filters?: StatsFilters) => Promise<void>;
  fetchSalesByDay: (filters?: StatsFilters) => Promise<void>;
  fetchSalesByMonth: (filters?: StatsFilters) => Promise<void>;
  fetchTopProducts: (filters?: StatsFilters) => Promise<void>;
  fetchSalesByPaymentMethod: (filters?: StatsFilters) => Promise<void>;
  fetchSalesByHour: (filters?: StatsFilters) => Promise<void>;
  fetchAverageTicketByDay: (filters?: StatsFilters) => Promise<void>;
  fetchSalesByWarehouse: (filters?: StatsFilters) => Promise<void>;
  fetchTopCustomers: (filters?: StatsFilters) => Promise<void>;
  fetchSalesByCategory: (filters?: StatsFilters) => Promise<void>;
  fetchProductMargins: (filters?: StatsFilters) => Promise<void>;
  fetchPurchasesSummary: (filters?: StatsFilters) => Promise<void>;
  fetchPurchasesByMonth: (filters?: StatsFilters) => Promise<void>;
  fetchPurchasesBySupplier: (filters?: StatsFilters) => Promise<void>;
  fetchProductsAddedByMonth: (filters?: StatsFilters) => Promise<void>;
  fetchLowStockProducts: (filters?: StatsFilters) => Promise<void>;
  fetchStockValue: (filters?: StatsFilters) => Promise<void>;
  fetchMovementTypesFrequency: (filters?: StatsFilters) => Promise<void>;
  fetchUserActivity: (filters?: StatsFilters) => Promise<void>;
  fetchSalesActivity: (filters?: StatsFilters) => Promise<void>;
  fetchPurchasesActivity: (filters?: StatsFilters) => Promise<void>;
  fetchOperationsActivity: (filters?: StatsFilters) => Promise<void>;
  fetchSalesByDate: (filters?: StatsFilters) => Promise<void>;
  fetchPurchasesByDate: (filters?: StatsFilters) => Promise<void>;
  fetchOperationsByDate: (filters?: StatsFilters) => Promise<void>;
  fetchUserCount: (filters?: StatsFilters) => Promise<void>;
  fetchDashboardOverview: (filters?: StatsFilters) => Promise<void>;
  fetchAll: (filters?: StatsFilters) => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  salesSummary: null,
  salesByDay: [],
  salesByMonth: [],
  topProducts: [],
  salesByPaymentMethod: [],
  salesByHour: [],
  averageTicketByDay: [],
  salesByWarehouse: [],
  topCustomers: [],
  salesByCategory: [],
  productMargins: [],
  purchasesSummary: null,
  purchasesByMonth: [],
  purchasesBySupplier: [],
  productsAddedByMonth: [],
  lowStockProducts: [],
  stockValue: null,
  movementTypesFrequency: [],
  userActivity: [],
  salesActivity: [],
  purchasesActivity: [],
  operationsActivity: [],
  salesByDate: [],
  purchasesByDate: [],
  operationsByDate: [],
  userCount: null,
  dashboardOverview: null,
  loading: false,
  error: null,

  fetchSalesSummary: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getSalesSummary(filters);
      if (res.success) set({ salesSummary: res.data });
      else set({ error: res.message || "Error fetching sales summary" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching sales summary" });
    } finally {
      set({ loading: false });
    }
  },

  fetchSalesByDay: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getSalesByDay(filters);
      if (res.success) set({ salesByDay: res.data || [] });
      else set({ error: res.message || "Error fetching sales by day" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching sales by day" });
    } finally {
      set({ loading: false });
    }
  },

  fetchSalesByMonth: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getSalesByMonth(filters);
      if (res.success) set({ salesByMonth: res.data || [] });
      else set({ error: res.message || "Error fetching sales by month" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching sales by month" });
    } finally {
      set({ loading: false });
    }
  },

  fetchTopProducts: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getTopProducts(filters);
      if (res.success) set({ topProducts: res.data || [] });
      else set({ error: res.message || "Error fetching top products" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching top products" });
    } finally {
      set({ loading: false });
    }
  },

  fetchSalesByPaymentMethod: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getSalesByPaymentMethod(filters);
      if (res.success) set({ salesByPaymentMethod: res.data || [] });
      else set({ error: res.message || "Error fetching sales by payment method" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching sales by payment method" });
    } finally {
      set({ loading: false });
    }
  },

  fetchSalesByHour: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getSalesByHour(filters);
      if (res.success) set({ salesByHour: res.data || [] });
      else set({ error: res.message || "Error fetching sales by hour" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching sales by hour" });
    } finally {
      set({ loading: false });
    }
  },

  fetchAverageTicketByDay: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getAverageTicketByDay(filters);
      if (res.success) set({ averageTicketByDay: res.data || [] });
      else set({ error: res.message || "Error fetching average ticket by day" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching average ticket by day" });
    } finally {
      set({ loading: false });
    }
  },

  fetchSalesByWarehouse: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getSalesByWarehouse(filters);
      if (res.success) set({ salesByWarehouse: res.data || [] });
      else set({ error: res.message || "Error fetching sales by warehouse" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching sales by warehouse" });
    } finally {
      set({ loading: false });
    }
  },

  fetchTopCustomers: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getTopCustomers(filters);
      if (res.success) set({ topCustomers: res.data || [] });
      else set({ error: res.message || "Error fetching top customers" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching top customers" });
    } finally {
      set({ loading: false });
    }
  },

  fetchSalesByCategory: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getSalesByCategory(filters);
      if (res.success) set({ salesByCategory: res.data || [] });
      else set({ error: res.message || "Error fetching sales by category" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching sales by category" });
    } finally {
      set({ loading: false });
    }
  },

  fetchProductMargins: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getProductMargins(filters);
      if (res.success) set({ productMargins: res.data || [] });
      else set({ error: res.message || "Error fetching product margins" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching product margins" });
    } finally {
      set({ loading: false });
    }
  },

  fetchPurchasesSummary: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getPurchasesSummary(filters);
      if (res.success) set({ purchasesSummary: res.data });
      else set({ error: res.message || "Error fetching purchases summary" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching purchases summary" });
    } finally {
      set({ loading: false });
    }
  },

  fetchPurchasesByMonth: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getPurchasesByMonth(filters);
      if (res.success) set({ purchasesByMonth: res.data || [] });
      else set({ error: res.message || "Error fetching purchases by month" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching purchases by month" });
    } finally {
      set({ loading: false });
    }
  },

  fetchPurchasesBySupplier: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getPurchasesBySupplier(filters);
      if (res.success) set({ purchasesBySupplier: res.data || [] });
      else set({ error: res.message || "Error fetching purchases by supplier" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching purchases by supplier" });
    } finally {
      set({ loading: false });
    }
  },

  fetchProductsAddedByMonth: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getProductsAddedByMonth(filters);
      if (res.success) set({ productsAddedByMonth: res.data || [] });
      else set({ error: res.message || "Error fetching products added by month" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching products added by month" });
    } finally {
      set({ loading: false });
    }
  },

  fetchLowStockProducts: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getLowStockProducts(filters);
      if (res.success) set({ lowStockProducts: res.data || [] });
      else set({ error: res.message || "Error fetching low stock products" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching low stock products" });
    } finally {
      set({ loading: false });
    }
  },

  fetchStockValue: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getStockValue(filters);
      if (res.success) set({ stockValue: res.data });
      else set({ error: res.message || "Error fetching stock value" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching stock value" });
    } finally {
      set({ loading: false });
    }
  },

  fetchMovementTypesFrequency: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getMovementTypesFrequency(filters);
      if (res.success) set({ movementTypesFrequency: res.data || [] });
      else set({ error: res.message || "Error fetching movement types frequency" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching movement types frequency" });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserActivity: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getUserActivity(filters);
      if (res.success) set({ userActivity: res.data || [] });
      else set({ error: res.message || "Error fetching user activity" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching user activity" });
    } finally {
      set({ loading: false });
    }
  },

  fetchSalesActivity: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getSalesActivity(filters);
      if (res.success) set({ salesActivity: res.data || [] });
      else set({ error: res.message || "Error fetching sales activity" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching sales activity" });
    } finally {
      set({ loading: false });
    }
  },

  fetchPurchasesActivity: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getPurchasesActivity(filters);
      if (res.success) set({ purchasesActivity: res.data || [] });
      else set({ error: res.message || "Error fetching purchases activity" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching purchases activity" });
    } finally {
      set({ loading: false });
    }
  },

  fetchOperationsActivity: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getOperationsActivity(filters);
      if (res.success) set({ operationsActivity: res.data || [] });
      else set({ error: res.message || "Error fetching operations activity" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching operations activity" });
    } finally {
      set({ loading: false });
    }
  },

  fetchSalesByDate: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getSalesByDate(filters);
      if (res.success) set({ salesByDate: res.data || [] });
      else set({ error: res.message || "Error fetching sales by date" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching sales by date" });
    } finally {
      set({ loading: false });
    }
  },

  fetchPurchasesByDate: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getPurchasesByDate(filters);
      if (res.success) set({ purchasesByDate: res.data || [] });
      else set({ error: res.message || "Error fetching purchases by date" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching purchases by date" });
    } finally {
      set({ loading: false });
    }
  },

  fetchOperationsByDate: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getOperationsByDate(filters);
      if (res.success) set({ operationsByDate: res.data || [] });
      else set({ error: res.message || "Error fetching operations by date" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching operations by date" });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserCount: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getUserCount(filters);
      if (res.success) set({ userCount: res.data });
      else set({ error: res.message || "Error fetching user count" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching user count" });
    } finally {
      set({ loading: false });
    }
  },

  fetchDashboardOverview: async (filters) => {
    try {
      set({ loading: true, error: null });
      const res = await getDashboardOverview(filters);
      if (res.success) set({ dashboardOverview: res.data });
      else set({ error: res.message || "Error fetching dashboard overview" });
    } catch (error: any) {
      set({ error: error.message || "Error fetching dashboard overview" });
    } finally {
      set({ loading: false });
    }
  },

  fetchAll: async (filters) => {
    set({ loading: true, error: null });
    try {
      const [
        overview,
        paymentMethod,
        byHour,
        ticketByDay,
        byWarehouse,
        customers,
        byCategory,
        margins,
        bySupplier,
        movements,
        userActivityData,
        salesActivityData,
        purchasesActivityData,
        operationsActivityData,
        products,
        stock
      ] = await Promise.all([
        getDashboardOverview(filters),
        getSalesByPaymentMethod(filters),
        getSalesByHour(filters),
        getAverageTicketByDay(filters),
        getSalesByWarehouse(filters),
        getTopCustomers({ ...filters, limit: 10 }),
        getSalesByCategory(filters),
        getProductMargins({ ...filters, limit: 50 }),
        getPurchasesBySupplier(filters),
        getMovementTypesFrequency(filters),
        getUserActivity(filters),
        getSalesActivity(filters),
        getPurchasesActivity(filters),
        getOperationsActivity(filters),
        getProductsAddedByMonth(filters),
        getStockValue(filters)
      ]);
      
      if (overview.success && overview.data) {
        set({ dashboardOverview: overview.data });
        if (overview.data.purchases_by_month) {
          set({ purchasesByMonth: overview.data.purchases_by_month });
        }
        if (overview.data.top_selling_products) {
          set({ topProducts: overview.data.top_selling_products });
        }
        if (overview.data.low_stock_products) {
          set({ lowStockProducts: overview.data.low_stock_products });
        }
      }
      
      if (paymentMethod.success) set({ salesByPaymentMethod: paymentMethod.data || [] });
      if (byHour.success) set({ salesByHour: byHour.data || [] });
      if (ticketByDay.success) set({ averageTicketByDay: ticketByDay.data || [] });
      if (byWarehouse.success) set({ salesByWarehouse: byWarehouse.data || [] });
      if (customers.success) set({ topCustomers: customers.data || [] });
      if (byCategory.success) set({ salesByCategory: byCategory.data || [] });
      if (margins.success) set({ productMargins: margins.data || [] });
      if (bySupplier.success) set({ purchasesBySupplier: bySupplier.data || [] });
      if (movements.success) set({ movementTypesFrequency: movements.data || [] });
      if (userActivityData.success) set({ userActivity: userActivityData.data || [] });
      if (salesActivityData.success) set({ salesActivity: salesActivityData.data || [] });
      if (purchasesActivityData.success) set({ purchasesActivity: purchasesActivityData.data || [] });
      if (operationsActivityData.success) set({ operationsActivity: operationsActivityData.data || [] });
      if (products.success) set({ productsAddedByMonth: products.data || [] });
      if (stock.success) set({ stockValue: stock.data });
    } catch (error: any) {
      set({ error: error.message || "Error fetching stats" });
    } finally {
      set({ loading: false });
    }
  }
}));
