import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { useCategoriesStore } from '@/store/categoriesStore'
import  CategoriesCreateModal from './createModal'


export default function CategoriesPage() {
  const { items, fetch, loading } = useCategoriesStore()
  const [openCreateModal, setOpenCreateModal] = useState(false)

  useEffect(() => {
    fetch()
      .then(() => {
        console.log("Categories fetched", items)
      })
      .catch((err) => {
        console.error("Error fetching categories:", err)
      })
  }, [items.length, fetch])

  const columns = [
    { field: '_id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
  ]

  if (loading) return <p>Cargando...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Categorías </h1>
      <Button 
      variant="contained" 
      color="primary"
      onClick={() => setOpenCreateModal(true)}
      >
        Agregar Categoría
      </Button>
      <CategoriesCreateModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} />
      <div className="mt-4" style={{ height: 750 }}>
        <DataGrid
          rows={items ? items : []}
          columns={columns}
          localeText={{
            noRowsLabel: "Aún no hay categorías registradas.",
          }}
          getRowId={(row) => row._id}
        />
      </div>
    </div>
  )
}
