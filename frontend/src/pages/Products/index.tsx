import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { useProductsStore } from '@/store/productsStore'
import  ProductsCreateModal from './createModal'


export default function ProductsPage() {
  const { items, fetch, loading } = useProductsStore()
  const [openCreateModal, setOpenCreateModal] = useState(false)

  useEffect(() => {
    fetch()
      .then(() => {
        console.log("Products fetched", items)
      })
      .catch((err) => {
        console.error("Error fetching products:", err)
      })
  }, [items.length, fetch])

  const columns = [
    { field: '_id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'category', headerName: 'Categoria', flex: 1 },
    { field: 'stock', headerName: 'Stock', width: 100 },
    { field: 'price', headerName: 'Precio', width: 100 },
  ]

  if (loading) return <p>Cargando...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Productos </h1>
      <Button 
      variant="contained" 
      color="primary"
      onClick={() => setOpenCreateModal(true)}
      >
        Agregar Producto
      </Button>
      <ProductsCreateModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} />
      <div className="mt-4" style={{ height: 400 }}>
        <DataGrid
          rows={items ? items : []}
          columns={columns}
          localeText={{
            noRowsLabel: "Aún no hay productos registrados.",
          }}
          getRowId={(row) => row._id}
        />
      </div>
    </div>
  )
}
