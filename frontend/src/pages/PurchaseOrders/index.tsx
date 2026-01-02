import { useEffect, useState } from 'react'
import { DataGrid, type GridRenderCellParams } from '@mui/x-data-grid'
import { Button, Chip, Box, FormControl, InputLabel, Select, MenuItem, Alert, Snackbar } from '@mui/material'
import { usePurchaseOrdersStore } from '@/store/purchaseOrdersStore'
import PurchaseOrdersCreateModal from './createModal'
import PurchaseOrdersImportModal from './importModal'
import { Eye, Check, Trash, Upload, Download } from 'lucide-react'
import DeleteModal from '@/components/DeleteModal'
import PurchaseOrdersViewModal from './viewModal'
import { deletePurchaseOrder } from '@/services/api/purchaseOrders'
import { exportModule, type ExportFormat } from '@/services/api/exports'


export default function PurchaseOrdersPage() {
  const { items, fetch, loading, receive } = usePurchaseOrdersStore()
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openViewModal, setOpenViewModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [openImportModal, setOpenImportModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv')
  const [exportLoading, setExportLoading] = useState(false)
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  useEffect(() => {
    fetch()
      .catch((err) => {
        console.error("Error fetching purchase orders:", err)
      })
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'received': return 'success';
      case 'canceled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'received': return 'Recibida';
      case 'canceled': return 'Cancelada';
      default: return status;
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      await exportModule('purchaseOrders', exportFormat);
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
    { field: 'reference_number', headerName: 'Referencia', flex: 1 },
    { field: 'status', headerName: 'Estado', flex: 1, renderCell: (params: GridRenderCellParams) => {
      return <Chip label={getStatusLabel(params.row.status)} color={getStatusColor(params.row.status)} size="small" />
    }},
    { field: 'total_amount', headerName: 'Monto Total', flex: 1, renderCell: (params: GridRenderCellParams) => {
      return `$${(params.row.total_amount || 0).toFixed(2)}`
    }},
    { field: 'notes', headerName: 'Notas', flex: 1 },
    { field: 'actions', headerName: 'Acciones', width: 250, renderCell: (params: GridRenderCellParams) => {
      return (
        <div style={{ display: 'flex', gap: 5 }}>
          <Button variant="text" color="primary" size="small" onClick={() => {
            setOpenViewModal(true)
            setSelectedOrderId(params.row._id as string)
          }}><Eye /></Button>
          {params.row.status === 'pending' && (
            <Button variant="text" color="success" size="small" onClick={() => {
              receive(params.row._id as string)
                .then(() => fetch())
                .catch((err) => console.error("Error receiving order:", err))
            }}><Check /></Button>
          )}
          {params.row.status === 'pending' && (
            <Button variant="text" color="error" size="small" onClick={() => {
              setOpenDeleteModal(true)
              setSelectedOrderId(params.row._id as string)
            }}><Trash /></Button>
          )}
        </div>
      )
    }
  },
  ]

  if (loading) return <p>Cargando...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Órdenes de Compra</h1>
      
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
            Exportar Órdenes de Compra
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
            Importar Órdenes de Compra
          </Button>
        </Box>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateModal(true)}
        sx={{ marginBottom: 2 }}
      >
        Nueva Orden de Compra
      </Button>
      <PurchaseOrdersCreateModal open={openCreateModal} onClose={() => { setOpenCreateModal(false); fetch(); }} />
      <PurchaseOrdersImportModal 
        open={openImportModal} 
        onClose={() => setOpenImportModal(false)}
        onSuccess={() => {
          setOpenImportModal(false)
          fetch()
        }}
      />
      <PurchaseOrdersViewModal open={openViewModal} onClose={() => setOpenViewModal(false)} orderId={selectedOrderId} />
      <DeleteModal 
        open={openDeleteModal} 
        onClose={() => setOpenDeleteModal(false)} 
        title="Eliminar Orden de Compra" 
        description="¿Estás seguro de querer eliminar esta orden de compra?" 
        cancelButtonText="Cancelar" 
        confirmButtonText="Confirmar" 
        onCancel={() => setOpenDeleteModal(false)} 
        onConfirm={() => {
          deletePurchaseOrder(selectedOrderId as string)
          .then(() => {
            fetch()
            .catch((err) => {
              console.error("Error deleting purchase order:", err)
            })
            .finally(() => {
              setOpenDeleteModal(false)
            })
          })
        }}
      />
      <div className="mt-4 datagrid-theme" style={{ height: 750 }}>
        <DataGrid
          showToolbar={false}
          disableColumnMenu={true}
          disableRowSelectionOnClick
          rows={items ? items : []}
          columns={columns}
          localeText={{
            noRowsLabel: "Aún no hay órdenes de compra registradas.",
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

