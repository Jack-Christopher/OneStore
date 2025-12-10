import { useEffect, useState } from 'react'
import { DataGrid, type GridRenderCellParams } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { useSuppliersStore } from '@/store/suppliersStore'
import SuppliersCreateModal from './createModal'
import { Eye, Pencil, Trash } from 'lucide-react'
import DeleteModal from '@/components/DeleteModal'
import SuppliersViewModal from './viewModal'
import SuppliersEditModal from './editModal'
import { deleteSupplier } from '@/services/api/suppliers'
import ExportImportButtons from '@/components/ExportImportButtons'


export default function SuppliersPage() {
  const { items, fetch, loading } = useSuppliersStore()
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openViewModal, setOpenViewModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)

  useEffect(() => {
    fetch()
      .catch((err) => {
        console.error("Error fetching suppliers:", err)
      })
  }, []);

  const columns = [
    { field: '_id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'contact_name', headerName: 'Contacto', flex: 1 },
    { field: 'document', headerName: 'Documento (RUC/DNI)', flex: 1 },
    { field: 'phone', headerName: 'Teléfono', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'address', headerName: 'Dirección', flex: 1 },
    {
      field: 'actions', headerName: 'Acciones', width: 250, renderCell: (params: GridRenderCellParams) => {
        return (
          <div style={{ display: 'flex', gap: 5 }}>
            <Button variant="text" color="primary" size="small" onClick={() => {
              setOpenViewModal(true)
              setSelectedSupplierId(params.row._id as string)
            }}><Eye /></Button>
            <Button variant="text" style={{ color: '#FFC107' }} size="small" onClick={() => {
              setOpenEditModal(true)
              setSelectedSupplierId(params.row._id as string)
            }}><Pencil /></Button>
            <Button variant="text" color="error" size="small" onClick={() => {
              setOpenDeleteModal(true)
              setSelectedSupplierId(params.row._id as string)
            }}><Trash /></Button>
          </div>
        )
      }
    },
  ]

  if (loading) return <p>Cargando...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Proveedores</h1>
      <ExportImportButtons 
        module="suppliers" 
        moduleLabel="Proveedores"
        onImportSuccess={() => fetch()}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateModal(true)}
      >
        Agregar Proveedor
      </Button>
      <SuppliersCreateModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} />
      <SuppliersViewModal open={openViewModal} onClose={() => setOpenViewModal(false)} supplierId={selectedSupplierId} />
      <SuppliersEditModal open={openEditModal} onClose={() => setOpenEditModal(false)} supplierId={selectedSupplierId} />
      <DeleteModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        title="Eliminar Proveedor"
        description="¿Estás seguro de querer eliminar este proveedor?"
        cancelButtonText="Cancelar"
        confirmButtonText="Confirmar"
        onCancel={() => setOpenDeleteModal(false)}
        onConfirm={() => {
          deleteSupplier(selectedSupplierId as string)
            .then(() => {
              fetch()
                .catch((err) => {
                  console.error("Error deleting supplier:", err)
                })
                .finally(() => {
                  setOpenDeleteModal(false)
                })
            })
        }}
      />
      <div className="mt-4" style={{ height: 750 }}>
        <DataGrid
          rows={items ? items : []}
          columns={columns}
          localeText={{
            noRowsLabel: "Aún no hay proveedores registrados.",
          }}
          getRowId={(row) => row._id}
        />
      </div>
    </div>
  )
}

