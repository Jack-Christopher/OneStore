import { useEffect, useState, useRef } from 'react'
import { DataGrid, type GridRenderCellParams } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { useUnitsOfMeasureStore } from '@/store/unitsOfMeasureStore'
import  UnitsOfMeasureCreateModal from './createModal'
import { Eye, Pencil, Trash } from 'lucide-react'
import UnitsOfMeasureEditModal from './editModal'
import UnitsOfMeasureViewModal from './viewModal'
import DeleteModal from '@/components/DeleteModal'
import { deleteUnitOfMeasure } from '@/services/api/unitsOfMeasure'
import ExportImportButtons from '@/components/ExportImportButtons'


export default function UnitsOfMeasurePage() {
  const { items, fetch, loading } = useUnitsOfMeasureStore()
  const [openCreateModal, setOpenCreateModal] = useState(false)
  
  const [openViewModal, setOpenViewModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedUnitOfMeasureId, setSelectedUnitOfMeasureId] = useState<string | null>(null)
  const hasFetchedRef = useRef(false)

  // Fetch data only on mount
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetch()
        .catch((err) => {
          console.error("Error fetching units of measure:", err)
        })
    }
  }, [fetch])

  // Refresh function to be called after CRUD operations
  const refreshData = () => {
    fetch()
      .catch((err) => {
        console.error("Error refreshing units of measure:", err)
      })
  }

  const columns = [
    { field: '_id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'code', headerName: 'Código', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'actions', headerName: 'Acciones', width: 250, renderCell: (params: GridRenderCellParams) => {

      if (params.row.tenant_id === "default") {
        return (
          <div style={{ display: 'flex', gap: 5 }}>
            <Button variant="text" color="primary" size="small" onClick={() => {
              setOpenViewModal(true)
              setSelectedUnitOfMeasureId(params.row._id as string)
            }}><Eye /></Button>
            <p className="text-sm text-gray-500">Medida Estándar</p>
          </div>
        )
      }

      return (
        <div style={{ display: 'flex', gap: 5 }}>
          <Button variant="text" color="primary" size="small" onClick={() => {
            setOpenViewModal(true)
            setSelectedUnitOfMeasureId(params.row._id as string)
          }}><Eye /></Button>
          <Button variant="text" style={{ color: '#FFC107' }} size="small" onClick={() => {
            setOpenEditModal(true)
            setSelectedUnitOfMeasureId(params.row._id as string)
          }}><Pencil /></Button>
          <Button variant="text" color="error" size="small" onClick={() => {
            setOpenDeleteModal(true)
            setSelectedUnitOfMeasureId(params.row._id as string)
          }}><Trash /></Button>
        </div>
      )
    }},
  ];

  if (loading) return <p>Cargando...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Unidades de Medida </h1>
      <ExportImportButtons 
        module="unitsOfMeasure" 
        moduleLabel="Unidades de Medida"
        onImportSuccess={() => fetch()}
      />
      <Button 
      variant="contained" 
      color="primary"
      onClick={() => setOpenCreateModal(true)}
      >
        Agregar Unidad de Medida
      </Button>
      <UnitsOfMeasureCreateModal 
        open={openCreateModal} 
        onClose={() => setOpenCreateModal(false)}
        onSuccess={refreshData}
      />
      <UnitsOfMeasureViewModal open={openViewModal} onClose={() => setOpenViewModal(false)} unitOfMeasureId={selectedUnitOfMeasureId} />
      <UnitsOfMeasureEditModal 
        open={openEditModal} 
        onClose={() => setOpenEditModal(false)} 
        unitOfMeasureId={selectedUnitOfMeasureId}
        onSuccess={refreshData}
      />
      <DeleteModal 
        title="Eliminar Unidad de Medida"
        description="¿Estás seguro de querer eliminar esta unidad de medida?"
        cancelButtonText="Cancelar"
        confirmButtonText="Eliminar"
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onCancel={() => setOpenDeleteModal(false)}
        onConfirm={async () => {
          try {
            await deleteUnitOfMeasure(selectedUnitOfMeasureId as string)
            refreshData()
            setOpenDeleteModal(false)
            setSelectedUnitOfMeasureId(null)
          } catch (err) {
            console.error("Error deleting unit of measure:", err)
            setOpenDeleteModal(false)
          }
        }} />
      <div className="mt-4 datagrid-theme" style={{ height: 750 }}>
        <DataGrid
          disableRowSelectionOnClick
          rows={items ? items : []}
          columns={columns}
          localeText={{
            noRowsLabel: "Aún no hay unidades de medidas registradas.",
          }}
          getRowId={(row) => row._id}
        />
      </div>
    </div>
  )
}
