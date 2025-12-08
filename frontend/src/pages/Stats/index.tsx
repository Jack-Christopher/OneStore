import { useEffect } from "react";
import { Typography, Box, Alert } from "@mui/material";
import { useStatsStore } from "@/store/statsStore";
import { useAuthStore } from "@/store/authStore";
import KPICardsRow from "./components/KPICardsRow";
import SalesLineChart from "./components/SalesLineChart";
import PurchasesBarChart from "./components/PurchasesBarChart";
import ProductsAddedLineChart from "./components/ProductsAddedLineChart";
import StockValuePieChart from "./components/StockValuePieChart";
import TopProductsTable from "./components/TopProductsTable";
import LowStockTable from "./components/LowStockTable";
import SalesByPaymentMethodPieChart from "./components/SalesByPaymentMethodPieChart";
import SalesByHourAreaChart from "./components/SalesByHourAreaChart";
import TopProductsHorizontalBar from "./components/TopProductsHorizontalBar";
import ProductMarginsScatterChart from "./components/ProductMarginsScatterChart";
import SalesByCategoryBarChart from "./components/SalesByCategoryBarChart";
import MonthComparisonGroupedBar from "./components/MonthComparisonGroupedBar";
import ProductsGrowthStepLineChart from "./components/ProductsGrowthStepLineChart";
import PurchasesBySupplierLineChart from "./components/PurchasesBySupplierLineChart";
import SalesByWarehouseBarChart from "./components/SalesByWarehouseBarChart";
import AverageTicketByDayLineChart from "./components/AverageTicketByDayLineChart";
import TopCustomersBarChart from "./components/TopCustomersBarChart";
import MovementTypesBarChart from "./components/MovementTypesBarChart";
import StockRotationDonutChart from "./components/StockRotationDonutChart";
import InventoryEvolutionLineChart from "./components/InventoryEvolutionLineChart";
import UserActivityHeatmap from "./components/UserActivityHeatmap";

export default function StatsPage() {
  const user = useAuthStore.getState().authUser?.user;
  const {
    dashboardOverview,
    salesByMonth,
    purchasesByMonth,
    productsAddedByMonth,
    stockValue,
    topProducts,
    lowStockProducts,
    salesByPaymentMethod,
    salesByHour,
    averageTicketByDay,
    salesByWarehouse,
    topCustomers,
    salesByCategory,
    productMargins,
    purchasesBySupplier,
    movementTypesFrequency,
    userActivity,
    loading,
    error,
    fetchAll,
    fetchMovementTypesFrequency,
    fetchUserActivity
  } = useStatsStore();

  useEffect(() => {
    const filters: any = {};
    
    // Admin can filter by tenant_id
    if (user?.role === 'admin') {
      // Could add tenant filter UI here in the future
    }
    
    fetchAll(filters);
    fetchMovementTypesFrequency(filters);
    fetchUserActivity(filters);
  }, [fetchAll, fetchMovementTypesFrequency, fetchUserActivity, user?.role]);

  if (error) {
    return (
      <div className="p-4">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      <Typography variant="h4" className="mb-6 font-bold">
        Estadísticas
      </Typography>

      {/* KPI Cards */}
      {dashboardOverview && (
        <KPICardsRow
          totalSalesAmount={dashboardOverview.total_sales_amount}
          totalSalesCount={dashboardOverview.total_sales_count}
          averageTicket={dashboardOverview.average_ticket}
          comparisonVsLastMonth={dashboardOverview.comparison_vs_last_month}
          totalPurchasesAmount={dashboardOverview.total_purchases_amount}
          averageCostPerDay={dashboardOverview.average_cost_per_day}
          stockValue={dashboardOverview.stock_value}
          stockRotation={dashboardOverview.stock_rotation}
          newProductsMonth={dashboardOverview.new_products_month}
          productsActive={dashboardOverview.products_active}
          productsInactive={dashboardOverview.products_inactive}
          activeEmployees={dashboardOverview.active_employees}
          newEmployeesMonth={dashboardOverview.new_employees_month}
        />
      )}

      {/* Main Charts Section */}
      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* 1. Ventas totales por día (línea) */}
        {dashboardOverview?.sales_by_day && dashboardOverview.sales_by_day.length > 0 && (
          <SalesLineChart data={dashboardOverview.sales_by_day.map(d => ({
            month: d.date,
            totalSales: d.totalSales,
            totalAmount: d.totalAmount
          }))} />
        )}

        {/* 2. Cantidad de productos vendidos por categoría (barra) */}
        {salesByCategory.length > 0 && (
          <SalesByCategoryBarChart data={salesByCategory} />
        )}

        {/* 3. Top 10 productos más vendidos (horizontal bar) */}
        {topProducts.length > 0 && (
          <TopProductsHorizontalBar data={topProducts} limit={10} />
        )}

        {/* 4. Margen bruto por producto (scatter plot) */}
        {productMargins.length > 0 && (
          <ProductMarginsScatterChart data={productMargins} limit={50} />
        )}

        {/* 7. Ventas por método de pago (pie) */}
        {salesByPaymentMethod.length > 0 && (
          <SalesByPaymentMethodPieChart data={salesByPaymentMethod} />
        )}

        {/* 9. Frecuencia de tipos de movimiento de stock (bar) */}
        {movementTypesFrequency.length > 0 && (
          <MovementTypesBarChart data={movementTypesFrequency} />
        )}

        {/* 10. Comparativa mes vs mes pasado (bar grouped) */}
        {dashboardOverview && (
          <MonthComparisonGroupedBar
            salesData={[]}
            currentMonth={new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
            lastMonth={new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
            currentSalesAmount={dashboardOverview.total_sales_amount}
            lastSalesAmount={dashboardOverview.last_month_sales_amount || (dashboardOverview.total_sales_amount / (1 + dashboardOverview.comparison_vs_last_month / 100))}
            currentSalesCount={dashboardOverview.total_sales_count}
            lastSalesCount={dashboardOverview.last_month_sales_count || Math.round(dashboardOverview.total_sales_count / (1 + dashboardOverview.comparison_vs_last_month / 100))}
            currentAverageTicket={dashboardOverview.average_ticket}
            lastAverageTicket={dashboardOverview.last_month_average_ticket || dashboardOverview.average_ticket}
          />
        )}

        {/* 11. Crecimiento de nuevos productos (línea escalonada) */}
        {productsAddedByMonth.length > 0 && (
          <ProductsGrowthStepLineChart data={productsAddedByMonth} />
        )}

        {/* 12. Evolución de compras por proveedor (línea) */}
        {purchasesBySupplier.length > 0 && (
          <PurchasesBySupplierLineChart data={purchasesBySupplier} />
        )}

        {/* 13. Ingresos por almacén (bar) */}
        {salesByWarehouse.length > 0 && (
          <SalesByWarehouseBarChart data={salesByWarehouse} />
        )}

        {/* 14. Ventas por hora del día (área) */}
        {salesByHour.length > 0 && (
          <SalesByHourAreaChart data={salesByHour} />
        )}

        {/* 15. Ticket promedio por día (línea) */}
        {averageTicketByDay.length > 0 && (
          <AverageTicketByDayLineChart data={averageTicketByDay} />
        )}

        {/* 16. Top clientes recurrentes (bar) */}
        {topCustomers.length > 0 && (
          <TopCustomersBarChart data={topCustomers} limit={10} />
        )}

        {/* 6. Rotación de inventario (donut) */}
        {dashboardOverview && (
          <StockRotationDonutChart 
            stockRotation={dashboardOverview.stock_rotation}
            totalStockValue={dashboardOverview.stock_value}
          />
        )}

        {/* Purchases Bar Chart */}
        {dashboardOverview?.purchases_by_month && dashboardOverview.purchases_by_month.length > 0 && (
          <PurchasesBarChart data={dashboardOverview.purchases_by_month} />
        )}

        {/* Products Added Line Chart */}
        {productsAddedByMonth.length > 0 && (
          <ProductsAddedLineChart data={productsAddedByMonth} />
        )}

        {/* Stock Value Pie Chart */}
        {dashboardOverview && stockValue && (
          <StockValuePieChart 
            data={stockValue.byCategory || []} 
            totalValue={dashboardOverview.stock_value}
          />
        )}

        {/* 5. Evolución del inventario por producto (línea) - Nota: Requiere selección de producto */}
        <InventoryEvolutionLineChart />

        {/* 8. Actividad por usuario (heatmap) */}
        {userActivity.length > 0 && (
          <Box className="lg:col-span-2">
            <UserActivityHeatmap data={userActivity} />
          </Box>
        )}
      </Box>

      {/* Tables Section */}
      <Box className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Top Products Table */}
        <TopProductsTable 
          data={dashboardOverview?.top_selling_products || []} 
          loading={loading}
        />

        {/* Low Stock Table - 17. Nivel de stock crítico */}
        <LowStockTable 
          data={dashboardOverview?.low_stock_products || []} 
          loading={loading}
        />
      </Box>

      {loading && (
        <Box className="mt-4">
          <Typography variant="body2" className="text-gray-500">
            Cargando estadísticas...
          </Typography>
        </Box>
      )}
    </div>
  );
}

