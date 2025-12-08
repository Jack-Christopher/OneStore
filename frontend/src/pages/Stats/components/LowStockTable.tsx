import { Card, CardContent, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";

interface LowStockProduct {
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
}

interface LowStockTableProps {
  data: LowStockProduct[];
  loading?: boolean;
}

export default function LowStockTable({ data, loading = false }: LowStockTableProps) {
  const columns: GridColDef[] = [
    {
      field: "productName",
      headerName: "Producto",
      flex: 1,
      minWidth: 200
    },
    {
      field: "currentStock",
      headerName: "Stock Actual",
      flex: 1,
      minWidth: 150,
      align: "center",
      headerAlign: "center",
      cellClassName: 'warning-column',
      headerClassName: 'warning-column'
    },
    {
      field: "minStock",
      headerName: "Stock Mínimo",
      flex: 1,
      minWidth: 150,
      align: "center",
      headerAlign: "center"
    }
  ];

  const rows = data.map((item, index) => ({
    id: item.productId || index,
    ...item
  }));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" className="mb-4 font-bold text-orange-600">
          ⚠️ Productos con Stock Bajo
        </Typography>
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
          rows={rows}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          hideFooter
          localeText={{
            noRowsLabel: "No hay productos con stock bajo",
          }}
        />
      </CardContent>
    </Card>
  );
}

