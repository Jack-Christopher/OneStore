import { useAuthStore } from "@/store/authStore";
import { useReportsStore } from "@/store/reportsStore";
import { Box, Card, CardContent, Typography, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/utils/currency";

export default function DashboardPage() {
  const user = useAuthStore.getState().authUser?.user;
  const {
    dashboardStats,
    fetchDashboardStats,
    loading
  } = useReportsStore();

  const [productsPaginationModel, setProductsPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const [categoriesPaginationModel, setCategoriesPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const [lowStockPaginationModel, setLowStockPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  useEffect(() => {
    fetchDashboardStats()
      .then(() => {
        console.log("Dashboard stats fetched");
      })
      .catch((err) => {
        console.error("Error fetching dashboard stats:", err);
      });
  }, [fetchDashboardStats]);

  const productGridColumns = [
    { field: 'productName', headerName: 'Producto', flex: 1 },
    { field: 'totalQuantity', headerName: 'Cantidad', flex: 1 },
    {
      field: 'totalAmount', headerName: 'Monto Total', flex: 1, cellClassName: 'main-column', headerClassName: 'main-column',
      renderCell: (params: any) => formatCurrency(params.value)
    },
  ];

  const categoryGridColumns = [
    { field: 'categoryName', headerName: 'Categoría', flex: 1 },
    { field: 'totalQuantity', headerName: 'Cantidad', flex: 1 },
    {
      field: 'totalAmount', headerName: 'Monto Total', flex: 1, cellClassName: 'main-column', headerClassName: 'main-column',
      renderCell: (params: any) => formatCurrency(params.value)
    },
  ];

  const lowStockGridColumns = [
    { field: 'productName', headerName: 'Producto', flex: 1 },
    { field: 'currentStock', headerName: 'Stock Actual', flex: 1, cellClassName: 'warning-column', headerClassName: 'warning-column' },
    { field: 'minStock', headerName: 'Stock Mínimo', flex: 1 },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <h2 className="text-xl font-bold mb-4">Bienvenido, {user?.fullname}</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Sales Summary Card */}
        <Card className="bg-blue-50">
          <CardContent>
            <Typography variant="subtitle2" color="textSecondary">Ventas</Typography>
            <Typography variant="h4" className="font-bold">
              {dashboardStats?.salesSummary?.totalSales || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Total: {formatCurrency(dashboardStats?.salesSummary?.totalAmount)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Promedio: {formatCurrency(dashboardStats?.salesSummary?.averageAmount)}
            </Typography>
          </CardContent>
        </Card>

        {/* Purchases Summary Card */}
        <Card className="bg-green-50">
          <CardContent>
            <Typography variant="subtitle2" color="textSecondary">Órdenes de Compra</Typography>
            <Typography variant="h4" className="font-bold">
              {dashboardStats?.purchasesSummary?.totalOrders || 0}
            </Typography>
            <div className="flex gap-1 mt-1 flex-wrap">
              <Chip size="small" label={`Pendientes: ${dashboardStats?.purchasesSummary?.pendingOrders || 0}`} color="warning" />
              <Chip size="small" label={`Recibidas: ${dashboardStats?.purchasesSummary?.receivedOrders || 0}`} color="success" />
            </div>
            <Typography variant="body2" color="textSecondary" className="mt-1">
              Total: {formatCurrency(dashboardStats?.purchasesSummary?.totalAmount)}
            </Typography>
          </CardContent>
        </Card>

        {/* Financial Summary Card */}
        <Card className="bg-purple-50">
          <CardContent>
            <Typography variant="subtitle2" color="textSecondary">Resumen Financiero</Typography>
            <Typography variant="h6" className="font-bold text-green-600">
              Ingresos: {formatCurrency(dashboardStats?.financialSummary?.totalIncome)}
            </Typography>
            <Typography variant="h6" className="text-red-600">
              Gastos: {formatCurrency(dashboardStats?.financialSummary?.totalExpenses)}
            </Typography>
            <Typography variant="body1" className="font-semibold mt-1">
              {dashboardStats?.financialSummary?.netProfit && dashboardStats?.financialSummary?.netProfit < 0 ? (
                <Typography variant="body2" className="text-red-600">
                  (Pérdida: {formatCurrency(dashboardStats?.financialSummary?.netProfit)})
                </Typography>
              ) : (
                <Typography variant="body2" className="text-green-600">
                  (Ganancia: {formatCurrency(dashboardStats?.financialSummary?.netProfit)})
                </Typography>
              )}
            </Typography>
          </CardContent>
        </Card>

        {/* Activity Summary Card */}
        <Card className="bg-orange-50">
          <CardContent>
            <Typography variant="subtitle2" color="textSecondary">Actividad</Typography>
            <div className="flex flex-col gap-1">
              <Typography variant="body2">
                <strong>{dashboardStats?.financialSummary?.salesCount || 0}</strong> ventas realizadas
              </Typography>
              <Typography variant="body2">
                <strong>{dashboardStats?.financialSummary?.purchasesCount || 0}</strong> compras registradas
              </Typography>
              <Typography variant="body2">
                <strong>{dashboardStats?.lowStockProducts?.length || 0}</strong> productos con stock bajo
              </Typography>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top selling products */}
        <Box className="col-span-1">
          <Card className="p-4">
            <CardContent>
              <Typography variant="h6">Productos más vendidos</Typography>
              <DataGrid
                sx={{
                  '& .MuiDataGrid-columnHeader.main-column': {
                    backgroundColor: '#568748 !important',
                    color: 'white !important',
                  },
                  '& .MuiDataGrid-cell.main-column': {
                    backgroundColor: '#bdd6b8 !important',
                    color: '#3b5736 !important',
                  },
                }}
                rows={dashboardStats?.topProducts?.map((p, idx) => ({ ...p, id: p.productId || idx })) || []}
                columns={productGridColumns}
                loading={loading}
                localeText={{
                  noRowsLabel: "Aún no hay productos vendidos.",
                }}
                paginationModel={productsPaginationModel}
                onPaginationModelChange={setProductsPaginationModel}
                pageSizeOptions={[5, 10, 25]}
              />
            </CardContent>
          </Card>
        </Box>

        {/* Top categories */}
        <Box className="col-span-1">
          <Card className="p-4">
            <CardContent>
              <Typography variant="h6">Categorías más vendidas</Typography>
              <DataGrid
                sx={{
                  '& .MuiDataGrid-columnHeader.main-column': {
                    backgroundColor: '#568748 !important',
                    color: 'white !important',
                  },
                  '& .MuiDataGrid-cell.main-column': {
                    backgroundColor: '#bdd6b8 !important',
                    color: '#3b5736 !important',
                  },
                }}
                rows={dashboardStats?.topCategories?.map((c, idx) => ({ ...c, id: c.categoryId || idx })) || []}
                columns={categoryGridColumns}
                loading={loading}
                localeText={{
                  noRowsLabel: "Aún no hay categorías con ventas.",
                }}
                paginationModel={categoriesPaginationModel}
                onPaginationModelChange={setCategoriesPaginationModel}
                pageSizeOptions={[5, 10, 25]}
              />
            </CardContent>
          </Card>
        </Box>

        {/* Low stock products */}
        <Box className="col-span-1 md:col-span-2">
          <Card className="p-4">
            <CardContent>
              <Typography variant="h6" className="text-orange-600">⚠️ Productos con stock bajo</Typography>
              <DataGrid
                sx={{
                  '& .MuiDataGrid-columnHeader.warning-column': {
                    backgroundColor: '#FFA726 !important',
                    color: 'white !important',
                  },
                  '& .MuiDataGrid-cell.warning-column': {
                    backgroundColor: '#f9e2a8 !important',
                    color: '#85775f !important',
                  },
                }}
                rows={dashboardStats?.lowStockProducts?.map((p, idx) => ({ ...p, id: p.productId || idx })) || []}
                columns={lowStockGridColumns}
                loading={loading}
                localeText={{
                  noRowsLabel: "No hay productos con stock bajo.",
                }}
                paginationModel={lowStockPaginationModel}
                onPaginationModelChange={setLowStockPaginationModel}
                pageSizeOptions={[5, 10, 25]}
              />
            </CardContent>
          </Card>
        </Box>
      </div>
    </div>
  )
}
