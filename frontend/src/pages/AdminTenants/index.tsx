import { useEffect, useState } from 'react'
import { DataGrid, type GridRenderCellParams } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { Eye, Pencil, Trash, Power } from 'lucide-react'
import { getTenants, createTenant, updateTenantStatus, type Tenant, type CreateTenantPayload, type UpdateTenantStatusPayload } from '@/services/api/admin'
import AdminTenantsCreateModal from './createModal'
import AdminTenantsViewModal from './viewModal'
import DeleteModal from '@/components/DeleteModal'
import Alert from '@/components/Alert'

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openViewModal, setOpenViewModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [openStatusModal, setOpenStatusModal] = useState(false)
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)

  const fetchTenants = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await getTenants()
      if (res.success) {
        setTenants(res.data)
      } else {
        setError(res.message || "Error al cargar tenants")
      }
    } catch (err: any) {
      console.error("Error fetching tenants:", err)
      setError(err?.response?.data?.message || "Error al cargar tenants")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [])

  const handleToggleStatus = async () => {
    if (!selectedTenant) return
    
    setLoading(true)
    setError("")
    try {
      const payload: UpdateTenantStatusPayload = {
        is_active: !selectedTenant.is_active
      }
      const res = await updateTenantStatus(selectedTenant._id, payload)
      if (res.success) {
        await fetchTenants()
        setOpenStatusModal(false)
        setSelectedTenant(null)
      } else {
        setError(res.message || "Error al actualizar estado")
      }
    } catch (err: any) {
      console.error("Error updating tenant status:", err)
      setError(err?.response?.data?.message || "Error al actualizar estado")
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'legal_name', headerName: 'Razón Social', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
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
      field: 'actions', headerName: 'Acciones', width: 300, renderCell: (params: GridRenderCellParams) => {
        return (
          <div style={{ display: 'flex', gap: 5 }}>
            <Button variant="text" color="primary" size="small" onClick={() => {
              setOpenViewModal(true)
              setSelectedTenantId(params.row._id as string)
            }}><Eye /></Button>
            <Button variant="text" style={{ color: params.row.is_active ? '#F44336' : '#4CAF50' }} size="small" onClick={() => {
              setSelectedTenant(params.row as Tenant)
              setOpenStatusModal(true)
            }}><Power /></Button>
          </div>
        )
      }
    },
  ]

  if (loading && tenants.length === 0) return <p>Cargando...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Gestión de Tenants</h1>
      {error && <Alert type="error" boldMessage="Error: " message={error} styles="mb-4" />}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateModal(true)}
      >
        Agregar Tenant
      </Button>

      <AdminTenantsCreateModal 
        open={openCreateModal} 
        onClose={() => {
          setOpenCreateModal(false)
          fetchTenants()
        }} 
      />
      <AdminTenantsViewModal 
        open={openViewModal} 
        onClose={() => setOpenViewModal(false)} 
        tenantId={selectedTenantId} 
      />
      <DeleteModal
        open={openStatusModal}
        onClose={() => {
          setOpenStatusModal(false)
          setSelectedTenant(null)
        }}
        title={selectedTenant?.is_active ? "Desactivar Tenant" : "Activar Tenant"}
        description={`¿Estás seguro de querer ${selectedTenant?.is_active ? 'desactivar' : 'activar'} este tenant?`}
        cancelButtonText="Cancelar"
        confirmButtonText={selectedTenant?.is_active ? "Desactivar" : "Activar"}
        onConfirm={handleToggleStatus}
        onCancel={() => {
          setOpenStatusModal(false)
          setSelectedTenant(null)
        }}
      />
      <div className="mt-4 datagrid-theme" style={{ height: 750 }}>
        <DataGrid
          showToolbar={false}
          disableColumnMenu={true}
          disableRowSelectionOnClick
          rows={tenants || []}
          columns={columns}
          localeText={{
            noRowsLabel: "Aún no hay tenants registrados.",
          }}
          getRowId={(row) => row._id}
          loading={loading}
        />
      </div>
    </div>
  )
}

