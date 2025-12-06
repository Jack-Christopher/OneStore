export interface SalesSummary {
  totalSales: number;
  totalAmount: number;
  averageAmount: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalAmount: number;
}

export interface TopCategory {
  categoryId: string;
  categoryName: string;
  totalQuantity: number;
  totalAmount: number;
}

export interface LowStockProduct {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
}

export interface PurchasesSummary {
  totalOrders: number;
  pendingOrders: number;
  receivedOrders: number;
  totalAmount: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  salesCount: number;
  purchasesCount: number;
}

export interface DashboardStats {
  salesSummary: SalesSummary;
  purchasesSummary: PurchasesSummary;
  financialSummary: FinancialSummary;
  topProducts: TopProduct[];
  topCategories: TopCategory[];
  lowStockProducts: LowStockProduct[];
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  warehouseId?: string;
  categoryId?: string;
}

