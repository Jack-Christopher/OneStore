import { useAuthStore } from "@/store/authStore";
import { useProductsStore } from "@/store/productsStore";
import { useSaleItemsStore } from "@/store/saleItemsStore";
import { useSalesStore } from "@/store/salesStore";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useEffect } from "react";

export default function DashboardPage() {
  const user = useAuthStore.getState().authUser?.user;
  const { mostSold: mostSoldProducts, fetchMostSold: fetchMostSoldProducts, loading: mostSoldProductsLoading } = useProductsStore();
  const { items: sales, fetch: fetchSales, loading: salesLoading } = useSalesStore();
  const { items: saleItems, fetch: fetchSaleItems, loading: saleItemsLoading } = useSaleItemsStore();

  useEffect(() => {
    fetchSales()
      .then(() => {
        console.log("Sales fetched", sales);
      })
      .catch((err) => {
        console.error("Error fetching sales:", err);
      });
  }, [sales.length, fetchSales]);

  useEffect(() => {
    fetchSaleItems()
      .then(() => {
        console.log("Sale items fetched", saleItems);
      })
      .catch((err) => {
        console.error("Error fetching sale items:", err);
      });
  }, [saleItems.length, fetchSaleItems]);
  
  useEffect(() => {
    console.log("run fmsp");
    fetchMostSoldProducts()
      .then(() => {
        console.log("Most sold products fetched", mostSoldProducts);
      })
      .catch((err) => {
        console.error("Error fetching most sold products:", err);
      });
  }, [mostSoldProducts.length, fetchMostSoldProducts]);

  const saleGridColumns = [
    { field: '_id', headerName: 'ID', width: 70 },
    { field: 'status', headerName: 'Estado', flex: 1 },
    { field: 'payment_method', headerName: 'Método de pago', flex: 1 },
    { field: 'total_amount', headerName: 'Monto Total', flex: 1 },
    { field: 'notes', headerName: 'Notas', flex: 1 },
  ];

  const productGridColumns = [
    { field: '_id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'sku', headerName: 'SKU', flex: 1 },
    { field: 'sale_price', headerName: 'Precio de Venta', flex: 1 },
    { field: 'total_quantity_sold', headerName: 'Total de Ventas', flex: 1 },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <h2 className="text-xl font-bold mb-4">Bienvenido, {user?.fullname}</h2>
      {/* a div with "linear" list of cards defaulted to 2 columns  */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top selling products */}
        <Box className="col-span-1">
          <Card className="p-4">
            <CardContent>
              <Typography variant="h6">Productos más vendidos</Typography>
              <DataGrid
                rows={mostSoldProducts ? mostSoldProducts : []}
                columns={productGridColumns}
                localeText={{
                  noRowsLabel: "Aún no hay productos vendidos.",
                }}
                getRowId={(row) => row._id}
              />
            </CardContent>
          </Card>
        </Box>
        {/* Highest-value sales */}
        <Box className="col-span-1">
          <Card className="p-4">
            <CardContent>
              <Typography variant="h6">Ventas más valoradas</Typography>
              <DataGrid
                sortModel={[{ field: 'total_amount', sort: 'desc' }]}
                onSortModelChange={(model) => {
                  console.log(model);
                }}
                rows={sales ? sales : []}
                columns={saleGridColumns}
                localeText={{
                  noRowsLabel: "Aún no hay ventas registradas.",
                }}
                getRowId={(row) => row._id}
              />
            </CardContent>
          </Card>
        </Box>
      </div>
    </div>
  )
}
