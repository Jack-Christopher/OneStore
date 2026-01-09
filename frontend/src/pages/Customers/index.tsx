import { useEffect, useState } from 'react'
import { DataGrid, type GridRenderCellParams } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { useCustomersStore } from '@/store/customersStore'
import CustomersCreateModal from './createModal'
import { Eye, Pencil, Trash } from 'lucide-react'
import DeleteModal from '@/components/DeleteModal'
import CustomersViewModal from './viewModal'
import CustomersEditModal from './editModal'
import { deleteCustomer } from '@/services/api/customers'
export default function CustomersPage() {
  const { items, fetch, loading } = useCustomersStore()
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openViewModal, setOpenViewModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

  useEffect(() => {
    fetch()
      .catch((err) => {
        console.error("Error fetching customers:", err)
      })
  }, []);

  const columns = [
    { field: '_id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'document', headerName: 'Documento (RUC/DNI)', flex: 1 },
    { field: 'phone', headerName: 'Teléfono', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'address', headerName: 'Dirección', flex: 1 },
    {
      field: 'is_active', headerName: 'Activo', flex: 0.5, renderCell: (params: GridRenderCellParams) => {
        return params.row.is_active ? 'Sí' : 'No'
      }
    },
    {
      field: 'actions', headerName: 'Acciones', width: 250, renderCell: (params: GridRenderCellParams) => {
        return (
          <div style={{ display: 'flex', gap: 5 }}>
            <Button variant="text" color="primary" size="small" onClick={() => {
              setOpenViewModal(true)
              setSelectedCustomerId(params.row._id as string)
            }}><Eye /></Button>
            <Button variant="text" style={{ color: '#FFC107' }} size="small" onClick={() => {
              setOpenEditModal(true)
              setSelectedCustomerId(params.row._id as string)
            }}><Pencil /></Button>
            <Button variant="text" color="error" size="small" onClick={() => {
              setOpenDeleteModal(true)
              setSelectedCustomerId(params.row._id as string)
            }}><Trash /></Button>
          </div>
        )
      }
    },
  ]

  if (loading) return <p>Cargando...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Clientes</h1>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateModal(true)}
      >
        Agregar Cliente
      </Button>
      <CustomersCreateModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} />
      <CustomersViewModal open={openViewModal} onClose={() => setOpenViewModal(false)} customerId={selectedCustomerId} />
      <CustomersEditModal open={openEditModal} onClose={() => setOpenEditModal(false)} customerId={selectedCustomerId} />
      <DeleteModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        title="Eliminar Cliente"
        description="¿Estás seguro de querer eliminar este cliente?"
        cancelButtonText="Cancelar"
        confirmButtonText="Confirmar"
        onCancel={() => setOpenDeleteModal(false)}
        onConfirm={() => {
          deleteCustomer(selectedCustomerId as string)
            .then(() => {
              fetch()
                .catch((err) => {
                  console.error("Error deleting customer:", err)
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
            noRowsLabel: "Aún no hay clientes registrados.",
          }}
          getRowId={(row) => row._id}
        />
      </div>
    </div>
  )
}
