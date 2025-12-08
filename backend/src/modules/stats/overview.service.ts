const salesRepository = require("./sales.repository");
const purchasesRepository = require("./purchases.repository");
const productsRepository = require("./products.repository");
const stockRepository = require("./stock.repository");
const usersRepository = require("./users.repository");

interface Filters {
  tenant_id?: string;
  user_id?: string;
}

async function getDashboard(filters: Filters) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Sales today
  const salesToday = await salesRepository.getSummary({
    ...filters,
    date_from: startOfToday,
    date_to: now
  });

  // Sales this month
  const salesMonth = await salesRepository.getSummary({
    ...filters,
    date_from: startOfMonth,
    date_to: now
  });

  // Sales last month (for comparison)
  const salesLastMonth = await salesRepository.getSummary({
    ...filters,
    date_from: startOfLastMonth,
    date_to: endOfLastMonth
  });

  // Purchases this month
  const purchasesMonth = await purchasesRepository.getSummary({
    ...filters,
    date_from: startOfMonth,
    date_to: now
  });

  // Products added this month
  const productsAddedMonth = await productsRepository.getAddedByMonth({
    ...filters,
    date_from: startOfMonth,
    date_to: now,
    limit: 12
  });

  // Stock value
  const stockValue = await stockRepository.getStockValue(filters);

  // Top products (limit 5)
  const topProducts = await salesRepository.getTopProducts({
    ...filters,
    limit: 5
  });

  // Low stock products (limit 5)
  const lowStockProducts = await productsRepository.getLowStock({
    ...filters,
    limit: 5
  });

  // Sales by day (last 30 days)
  const salesByDay = await salesRepository.getByDay({
    ...filters,
    limit: 30
  });

  // Average cost per day
  const averageCostPerDay = await purchasesRepository.getAverageCostPerDay({
    ...filters,
    date_from: startOfMonth,
    date_to: now
  });

  // Stock rotation
  const stockRotation = await productsRepository.getStockRotation(filters);

  // Products active/inactive
  const productsActiveInactive = await productsRepository.getActiveInactiveCount(filters);

  // Users
  const userCount = await usersRepository.getCount(filters);
  const activeUsers = await usersRepository.getActiveCount(filters);
  const usersAddedByMonth = await usersRepository.getAddedByMonth({
    ...filters,
    date_from: startOfMonth,
    date_to: now,
    limit: 1
  });

  // Calculate comparison
  const comparisonVsLastMonth = salesLastMonth.totalAmount > 0
    ? ((salesMonth.totalAmount - salesLastMonth.totalAmount) / salesLastMonth.totalAmount) * 100
    : 0;

  return {
    // Ventas
    total_sales_amount: salesMonth.totalAmount || 0,
    total_sales_count: salesMonth.totalSales || 0,
    average_ticket: salesMonth.averageAmount || 0,
    comparison_vs_last_month: comparisonVsLastMonth,
    sales_by_day: salesByDay,
    top_selling_products: topProducts,
    last_month_sales_amount: salesLastMonth.totalAmount || 0,
    last_month_sales_count: salesLastMonth.totalSales || 0,
    last_month_average_ticket: salesLastMonth.averageAmount || 0,
    
    // Additional sales data for comparison
    last_month_sales_amount: salesLastMonth.totalAmount || 0,
    last_month_sales_count: salesLastMonth.totalSales || 0,
    last_month_average_ticket: salesLastMonth.averageAmount || 0,
    
    // Compras
    total_purchases_amount: purchasesMonth.totalAmount || 0,
    purchases_by_month: await purchasesRepository.getByMonth({
      ...filters,
      date_from: new Date(now.getFullYear(), now.getMonth() - 11, 1),
      date_to: now,
      limit: 12
    }),
    average_cost_per_day: averageCostPerDay.averageCostPerDay || 0,
    
    // Stock
    stock_value: stockValue.totalValue || 0,
    low_stock_products: lowStockProducts,
    stock_rotation: stockRotation.rotation || 0,
    
    // Productos
    new_products_month: productsAddedMonth.length > 0 
      ? productsAddedMonth.reduce((sum: number, p: any) => sum + (p.totalProducts || 0), 0)
      : 0,
    products_active: productsActiveInactive.active || 0,
    products_inactive: productsActiveInactive.inactive || 0,
    
    // Usuarios
    active_employees: activeUsers || 0,
    new_employees_month: usersAddedByMonth.length > 0
      ? usersAddedByMonth.reduce((sum: number, u: any) => sum + (u.totalUsers || 0), 0)
      : 0
  };
}

module.exports = {
  getDashboard
};

