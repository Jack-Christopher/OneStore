import { useEffect, useState, useRef } from 'react'
import { DataGrid, type GridRenderCellParams } from '@mui/x-data-grid'
import { Button, Box, FormControl, InputLabel, Select, MenuItem, Alert, Snackbar } from '@mui/material'
import { useProductsStore } from '@/store/productsStore'
import ProductsCreateModal from './createModal'
import ProductsImportModal from './importModal'
import { Eye, Pencil, Trash, Upload, Download } from 'lucide-react'
import DeleteModal from '@/components/DeleteModal'
import ProductsViewModal from './viewModal'
import ProductsEditModal from './editModal'
import { deleteProduct } from '@/services/api/products'
import { exportModule, type ExportFormat } from '@/services/api/exports'


export default function ProductsPage() {
  const { items, fetch, loading } = useProductsStore()
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openViewModal, setOpenViewModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [openImportModal, setOpenImportModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [exportLoading, setExportLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  // Fetch data only on mount
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetch()
        .catch((err) => {
          console.error("Error fetching products:", err)
        })
    }
  }, [fetch])

  // Refresh function to be called after CRUD operations
  const refreshData = () => {
    fetch()
      .catch((err) => {
        console.error("Error refreshing products:", err)
      })
  }

  const handleExport = async () => {
    try {
      setExportLoading(true);
      await exportModule('products', exportFormat);
      setSnackbar({
        open: true,
        message: `Datos exportados exitosamente en formato ${exportFormat.toUpperCase()}`,
        severity: 'success',
      });
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: `Error al exportar: ${error.message || 'Error desconocido'}`,
        severity: 'error',
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'category_name', headerName: 'Categoría', flex: 1 },
    { field: 'unit_name', headerName: 'Unidad', flex: 1 },
    { field: 'sku', headerName: 'SKU', flex: 1 },
    { field: 'purchase_price', headerName: 'Precio de Compra', flex: 1 },
    { field: 'sale_price', headerName: 'Precio de Venta', flex: 1 },
    {
      field: 'currentStock',
      headerName: 'Stock Actual',
      flex: 1,
      cellClassName: 'stock-column',
      headerClassName: 'stock-column',
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ fontWeight: 'bold' }}>{params.value ?? 0}</span>
      )
    },
    { field: 'min_stock', headerName: 'Stock mínimo', flex: 1 },
    { field: 'max_stock', headerName: 'Stock máximo', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'actions', headerName: 'Acciones', width: 250, renderCell: (params: GridRenderCellParams) => {
        return (
          <div style={{ display: 'flex', gap: 5 }}>
            <Button variant="text" color="primary" size="small" onClick={() => {
              setOpenViewModal(true)
              setSelectedProductId(params.row._id as string)
            }}><Eye /></Button>
            <Button variant="text" style={{ color: '#FFC107' }} size="small" onClick={() => {
              setOpenEditModal(true)
              setSelectedProductId(params.row._id as string)
            }}><Pencil /></Button>
            <Button variant="text" color="error" size="small" onClick={() => {
              setOpenDeleteModal(true)
              setSelectedProductId(params.row._id as string)
            }}><Trash /></Button>
          </div>
        )
      }
    },
  ]

  if (loading) return <p>Cargando...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Productos </h1>
      
      {/* Export/Import Section */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          padding: 2,
          marginBottom: 2,
          backgroundColor: '#f5f5f5',
          borderRadius: 1,
          border: '1px solid #e0e0e0',
        }}
      >
        {/* Export Section */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Formato</InputLabel>
            <Select
              value={exportFormat}
              label="Formato"
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={exportLoading}
          >
            Exportar Productos
          </Button>
        </Box>

        {/* Import Section */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<Upload />}
            onClick={() => setOpenImportModal(true)}
          >
            Importar Productos
          </Button>
        </Box>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateModal(true)}
        sx={{ marginBottom: 2 }}
      >
        Agregar Producto
      </Button>
      <ProductsCreateModal 
        open={openCreateModal} 
        onClose={() => setOpenCreateModal(false)}
        onSuccess={refreshData}
      />
      <ProductsImportModal 
        open={openImportModal} 
        onClose={() => setOpenImportModal(false)}
        onSuccess={() => {
          setOpenImportModal(false)
          refreshData()
        }}
      />
      <ProductsViewModal open={openViewModal} onClose={() => setOpenViewModal(false)} productId={selectedProductId} />
      <ProductsEditModal 
        open={openEditModal} 
        onClose={() => setOpenEditModal(false)} 
        productId={selectedProductId}
        onSuccess={refreshData}
      />
      <DeleteModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        title="Eliminar Producto"
        description="¿Estás seguro de querer eliminar este producto?"
        cancelButtonText="Cancelar"
        confirmButtonText="Confirmar"
        onCancel={() => setOpenDeleteModal(false)}
        onConfirm={async () => {
          try {
            await deleteProduct(selectedProductId as string)
            refreshData()
            setOpenDeleteModal(false)
          } catch (err) {
            console.error("Error deleting product:", err)
            setOpenDeleteModal(false)
          }
        }}
      />
      <div className="mt-4 datagrid-theme" style={{ height: 750 }}>
        <DataGrid
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-columnHeader.stock-column': {
              backgroundColor: 'var(--secondary) !important',
              color: 'var(--secondary-foreground) !important',
            },
            '& .MuiDataGrid-cell.stock-column': {
              backgroundColor: 'var(--muted) !important',
              color: 'var(--foreground) !important',
            },
          }}
          rows={items ? items.map(p => ({
            ...p,
            // @ts-expect-error: Accessing snake_case property from an untyped object that might have it
            category_name: p.category_id?.name ?? "",
            // @ts-expect-error: Accessing snake_case property from an untyped object that might have it
            unit_name: p.unit_id?.name ?? "",
            currentStock: p.currentStock ?? 0
          }))
            : []}
          columns={columns}
          localeText={{
            noRowsLabel: "Aún no hay productos registrados.",
          }}
          getRowId={(row) => row._id}
        />
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}
