import { useEffect, useState } from 'react'
import { DataGrid, type GridRenderCellParams } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { useWarehousesStore } from '@/store/warehousesStore'
import WarehousesCreateModal from './createModal'
import { Eye, Pencil, Trash } from 'lucide-react'
import DeleteModal from '@/components/DeleteModal'
import WarehousesViewModal from './viewModal'
import WarehousesEditModal from './editModal'
import { deleteWarehouse } from '@/services/api/warehouses'
import ExportImportButtons from '@/components/ExportImportButtons'


export default function WarehousesPage() {
  const { items, fetch, loading } = useWarehousesStore()
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openViewModal, setOpenViewModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null)

  useEffect(() => {
    fetch()
      .catch((err) => {
        console.error("Error fetching warehouses:", err)
      })
  }, []);

  const columns = [
    { field: '_id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'address', headerName: 'Dirección', flex: 1 },
    { field: 'phone', headerName: 'Teléfono', flex: 1 },
    { field: 'is_active', headerName: 'Activa', flex: 0.5, renderCell: (params: GridRenderCellParams) => {
      return params.row.is_active ? 'Sí' : 'No'
    }},
    { field: 'actions', headerName: 'Acciones', width: 250, renderCell: (params: GridRenderCellParams) => {
      return (
        <div style={{ display: 'flex', gap: 5 }}>
          <Button variant="text" color="primary" size="small" onClick={() => {
            setOpenViewModal(true)
            setSelectedWarehouseId(params.row._id as string)
          }}><Eye /></Button>
          <Button variant="text" style={{ color: '#FFC107' }} size="small" onClick={() => {
            setOpenEditModal(true)
            setSelectedWarehouseId(params.row._id as string)
          }}><Pencil /></Button>
          <Button variant="text" color="error" size="small" onClick={() => {
            setOpenDeleteModal(true)
            setSelectedWarehouseId(params.row._id as string)
          }}><Trash /></Button>
        </div>
      )
    }
  },
  ]

  if (loading) return <p>Cargando...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Bodegas</h1>
      <ExportImportButtons 
        module="warehouses" 
        moduleLabel="Bodegas"
        onImportSuccess={() => fetch()}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateModal(true)}
      >
        Agregar Bodega
      </Button>
      <WarehousesCreateModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} />
      <WarehousesViewModal open={openViewModal} onClose={() => setOpenViewModal(false)} warehouseId={selectedWarehouseId} />
      <WarehousesEditModal open={openEditModal} onClose={() => setOpenEditModal(false)} warehouseId={selectedWarehouseId} />
      <DeleteModal 
        open={openDeleteModal} 
        onClose={() => setOpenDeleteModal(false)} 
        title="Eliminar Bodega" 
        description="¿Estás seguro de querer eliminar esta bodega?" 
        cancelButtonText="Cancelar" 
        confirmButtonText="Confirmar" 
        onCancel={() => setOpenDeleteModal(false)} 
        onConfirm={() => {
          deleteWarehouse(selectedWarehouseId as string)
          .then(() => {
            fetch()
            .catch((err) => {
              console.error("Error deleting warehouse:", err)
            })
            .finally(() => {
              setOpenDeleteModal(false)
            })
          })
        }}
      />
      <div className="mt-4 datagrid-theme" style={{ height: 750 }}>
        <DataGrid
          showToolbar={true}
          disableColumnMenu={true}
          disableRowSelectionOnClick
          rows={items ? items : []}
          columns={columns}
          localeText={{
            noRowsLabel: "Aún no hay bodegas registradas.",
          }}
          getRowId={(row) => row._id}
        />
      </div>
    </div>
  )
}

