import { useEffect, useState } from 'react'
import { DataGrid, type GridRenderCellParams } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { useCategoriesStore } from '@/store/categoriesStore'
import CategoriesCreateModal from './createModal'
import { Eye, Pencil, Trash } from 'lucide-react'
import CategoriesViewModal from './viewModal'
import CategoriesEditModal from './editModal'
import DeleteModal from '@/components/DeleteModal'


export default function CategoriesPage() {
  const { items, fetch, loading, remove } = useCategoriesStore()
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openViewModal, setOpenViewModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

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
    {
      field: 'actions', headerName: 'Acciones', width: 250, renderCell: (params: GridRenderCellParams) => {
        return (
          <div style={{ display: 'flex', gap: 5 }}>
            <Button variant="text" color="primary" size="small" onClick={() => {
              setOpenViewModal(true)
              setSelectedCategoryId(params.row._id as string)
            }}><Eye /></Button>
            <Button variant="text" style={{ color: '#FFC107' }} size="small" onClick={() => {
              setOpenEditModal(true)
              setSelectedCategoryId(params.row._id as string)
            }}><Pencil /></Button>
            <Button variant="text" color="error" size="small" onClick={() => {
              setOpenDeleteModal(true)
              setSelectedCategoryId(params.row._id as string)
            }}><Trash /></Button>
          </div>
        )
      }
    },
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
      <CategoriesViewModal open={openViewModal} onClose={() => setOpenViewModal(false)} categoryId={selectedCategoryId} />
      <CategoriesEditModal open={openEditModal} onClose={() => setOpenEditModal(false)} categoryId={selectedCategoryId} />
      <DeleteModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        title="Eliminar Categoría"
        description="¿Estás seguro de querer eliminar esta categoría?"
        cancelButtonText="Cancelar"
        confirmButtonText="Confirmar"
        onConfirm={() => {
          remove(selectedCategoryId as string)
          .then(() => {
            fetch()
            .catch((err) => {
              console.error("Error deleting category:", err)
            })
          })
          setOpenDeleteModal(false)
        }}
        onCancel={() => {
          setOpenDeleteModal(false)
        }}
      />
      <div className="mt-4" style={{ height: 750 }}>
        <DataGrid
          disableRowSelectionOnClick
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
