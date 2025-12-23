import { useEffect, useState } from 'react'
import { DataGrid, type GridRenderCellParams } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { Eye, Pencil, Trash } from 'lucide-react'
import { getClerks, createClerk, updateClerk, deleteClerk, type Clerk, type CreateClerkPayload, type UpdateClerkPayload } from '@/services/api/manager'
import ManagerClerksCreateModal from './createModal'
import ManagerClerksViewModal from './viewModal'
import ManagerClerksEditModal from './editModal'
import DeleteModal from '@/components/DeleteModal'
import Alert from '@/components/Alert'

export default function ManagerClerksPage() {
  const [clerks, setClerks] = useState<Clerk[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openViewModal, setOpenViewModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedClerkId, setSelectedClerkId] = useState<string | null>(null)

  const fetchClerks = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await getClerks()
      if (res.success) {
        setClerks(res.data)
      } else {
        setError(res.message || "Error al cargar clerks")
      }
    } catch (err: any) {
      console.error("Error fetching clerks:", err)
      setError(err?.response?.data?.message || "Error al cargar clerks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClerks()
  }, [])

  const handleDelete = async () => {
    if (!selectedClerkId) return
    
    setLoading(true)
    setError("")
    try {
      const res = await deleteClerk(selectedClerkId)
      if (res.success) {
        await fetchClerks()
        setOpenDeleteModal(false)
        setSelectedClerkId(null)
      } else {
        setError(res.message || "Error al eliminar clerk")
      }
    } catch (err: any) {
      console.error("Error deleting clerk:", err)
      setError(err?.response?.data?.message || "Error al eliminar clerk")
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { field: '_id', headerName: 'ID', width: 70 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'full_name', headerName: 'Nombre Completo', flex: 1 },
    { 
      field: 'is_active', 
      headerName: 'Estado', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <span className={params.row.is_active ? 'text-green-600' : 'text-red-600'}>
          {params.row.is_active ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
    {
      field: 'actions', headerName: 'Acciones', width: 250, renderCell: (params: GridRenderCellParams) => {
        return (
          <div style={{ display: 'flex', gap: 5 }}>
            <Button variant="text" color="primary" size="small" onClick={() => {
              setOpenViewModal(true)
              setSelectedClerkId(params.row._id as string)
            }}><Eye /></Button>
            <Button variant="text" style={{ color: '#FFC107' }} size="small" onClick={() => {
              setOpenEditModal(true)
              setSelectedClerkId(params.row._id as string)
            }}><Pencil /></Button>
            <Button variant="text" color="error" size="small" onClick={() => {
              setOpenDeleteModal(true)
              setSelectedClerkId(params.row._id as string)
            }}><Trash /></Button>
          </div>
        )
      }
    },
  ]

  if (loading && clerks.length === 0) return <p>Cargando...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Gestión de Clerks</h1>
      {error && <Alert type="error" boldMessage="Error: " message={error} styles="mb-4" />}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateModal(true)}
      >
        Agregar Clerk
      </Button>

      <ManagerClerksCreateModal 
        open={openCreateModal} 
        onClose={() => {
          setOpenCreateModal(false)
          fetchClerks()
        }} 
      />
      <ManagerClerksViewModal 
        open={openViewModal} 
        onClose={() => setOpenViewModal(false)} 
        clerkId={selectedClerkId} 
      />
      <ManagerClerksEditModal 
        open={openEditModal} 
        onClose={() => {
          setOpenEditModal(false)
          fetchClerks()
        }} 
        clerkId={selectedClerkId} 
      />
      <DeleteModal
        open={openDeleteModal}
        onClose={() => {
          setOpenDeleteModal(false)
          setSelectedClerkId(null)
        }}
        title="Eliminar Clerk"
        description="¿Estás seguro de querer eliminar este clerk?"
        cancelButtonText="Cancelar"
        confirmButtonText="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => {
          setOpenDeleteModal(false)
          setSelectedClerkId(null)
        }}
      />
      <div className="mt-4 datagrid-theme" style={{ height: 750 }}>
        <DataGrid
          showToolbar={true}
          disableColumnMenu={true}
          disableRowSelectionOnClick
          rows={clerks || []}
          columns={columns}
          localeText={{
            noRowsLabel: "Aún no hay clerks registrados.",
          }}
          getRowId={(row) => row._id}
          loading={loading}
        />
      </div>
    </div>
  )
}

