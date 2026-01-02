import { Card, CardContent, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { formatCurrency } from "@/utils/currency";

interface TopProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalAmount: number;
}

interface TopProductsTableProps {
  data: TopProduct[];
  loading?: boolean;
}

export default function TopProductsTable({ data, loading = false }: TopProductsTableProps) {
  const columns: GridColDef[] = [
    {
      field: "productName",
      headerName: "Producto",
      flex: 1,
      minWidth: 200
    },
    {
      field: "totalQuantity",
      headerName: "Cantidad Vendida",
      flex: 1,
      minWidth: 150,
      align: "center",
      headerAlign: "center"
    },
    {
      field: "totalAmount",
      headerName: "Monto Total",
      flex: 1,
      minWidth: 150,
      align: "right",
      headerAlign: "right",
      cellClassName: 'main-column',
      headerClassName: 'main-column',
      renderCell: (params) => formatCurrency(params.value)
    }
  ];

  const rows = data.map((item, index) => ({
    id: item.productId || index,
    ...item
  }));

  return (
    <Card className="bg-card">
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-card-foreground">
          Productos Más Vendidos
        </Typography>
        <div className="datagrid-theme">
          <DataGrid
            showToolbar={false}
            disableColumnMenu={true}
            disableRowSelectionOnClick
            sx={{
              '& .MuiDataGrid-columnHeader.main-column': {
                backgroundColor: 'var(--secondary) !important',
                color: 'var(--secondary-foreground) !important',
              },
              '& .MuiDataGrid-cell.main-column': {
                backgroundColor: 'var(--muted) !important',
                color: 'var(--foreground) !important',
              },
            }}
          rows={rows}
          columns={columns}
          loading={loading}
          autoHeight
          hideFooter
          localeText={{
            noRowsLabel: "No hay productos vendidos",
          }}
        />
        </div>
      </CardContent>
    </Card>
  );
}

