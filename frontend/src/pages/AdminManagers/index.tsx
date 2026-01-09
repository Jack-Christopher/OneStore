import { useEffect, useState } from 'react'
import { DataGrid, type GridRenderCellParams } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { Eye } from 'lucide-react'
import { createManager, type Manager, type CreateManagerPayload, getManagers } from '@/services/api/admin'
import AdminManagersCreateModal from './createModal'
import AdminManagersViewModal from './viewModal'
import Alert from '@/components/Alert'
import { getTenants, type Tenant } from '@/services/api/admin'

export default function AdminManagersPage() {
  const [managers, setManagers] = useState<Manager[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openViewModal, setOpenViewModal] = useState(false)
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null)

  const fetchTenants = async () => {
    try {
      const res = await getTenants()
      if (res.success) {
        setTenants(res.data)
      }
    } catch (err: any) {
      console.error("Error fetching tenants:", err)
    }
  }

  const fetchManagers = async () => {
    try {
      const res = await getManagers()
      if (res.success) {
        setManagers(res.data)
      }
    } catch (err: any) {
      console.error("Error fetching managers:", err)
    }
  }

  useEffect(() => {
    fetchTenants()
    fetchManagers()
  }, [])

  // Note: No hay endpoint para listar managers, solo para crearlos
  // En un sistema real, necesitarías agregar GET /api/admin/users/manager

  const columns = [
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
      field: 'actions', headerName: 'Acciones', width: 150, renderCell: (params: GridRenderCellParams) => {
        return (
          <div style={{ display: 'flex', gap: 5 }}>
            <Button variant="text" color="primary" size="small" onClick={() => {
              setOpenViewModal(true)
              setSelectedManagerId(params.row._id as string)
            }}><Eye /></Button>
          </div>
        )
      }
    },
  ]

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Gestión de Managers</h1>
      {error && <Alert type="error" boldMessage="Error: " message={error} styles="mb-4" />}
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateModal(true)}
      >
        Agregar Manager
      </Button>

      <AdminManagersCreateModal
        open={openCreateModal}
        onClose={() => {
          setOpenCreateModal(false)
          // Aquí podrías refrescar la lista si tuvieras un endpoint
        }}
        tenants={tenants}
        onSuccess={() => {
          setOpenCreateModal(false)
          // Aquí podrías refrescar la lista si tuvieras un endpoint
        }}
      />
      <AdminManagersViewModal
        open={openViewModal}
        onClose={() => setOpenViewModal(false)}
        managerId={selectedManagerId}
      />
      <div className="mt-4 datagrid-theme" style={{ height: 750 }}>
        <DataGrid
          showToolbar={false}
          disableColumnMenu={true}
          disableRowSelectionOnClick
          rows={managers || []}
          columns={columns}
          localeText={{
            noRowsLabel: "Aún no hay managers registrados.",
          }}
          getRowId={(row) => row._id}
          loading={loading}
        />
      </div>
    </div>
  )
}

