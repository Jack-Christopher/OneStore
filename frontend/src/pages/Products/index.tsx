import { useEffect, useState } from 'react'
import { DataGrid, type GridRenderCellParams } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { useProductsStore } from '@/store/productsStore'
import ProductsCreateModal from './createModal'
import { Eye, Pencil, Trash } from 'lucide-react'
import DeleteModal from '@/components/DeleteModal'
import ProductsViewModal from './viewModal'
import ProductsEditModal from './editModal'
import { deleteProduct } from '@/services/api/products'
import ExportImportButtons from '@/components/ExportImportButtons'


export default function ProductsPage() {
  const { items, fetch, loading } = useProductsStore()
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const [openViewModal, setOpenViewModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)

  useEffect(() => {
    fetch()
      .then(() => {
        console.log("Products fetched", items)
      })
      .catch((err) => {
        console.error("Error fetching products:", err)
      })
  }, []);

  const columns = [
    { field: '_id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'category_name', headerName: 'Categoría', flex: 1 },
    { field: 'unit_name', headerName: 'Unidad', flex: 1 },
    { field: 'sku', headerName: 'SKU', flex: 1 },
    { field: 'purchase_price', headerName: 'Precio de Compra', flex: 1 },
    { field: 'sale_price', headerName: 'Precio de Venta', flex: 1 },
    {
      field: 'currentStock',
      headerName: 'Stock Actual',
      flex: 1,
      cellClassName: 'stock-column',
      headerClassName: 'stock-column',
      renderCell: (params: GridRenderCellParams) => (
        <span style={{ fontWeight: 'bold' }}>{params.value ?? 0}</span>
      )
    },
    { field: 'min_stock', headerName: 'Stock mínimo', flex: 1 },
    { field: 'max_stock', headerName: 'Stock máximo', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'actions', headerName: 'Acciones', width: 250, renderCell: (params: GridRenderCellParams) => {
        return (
          <div style={{ display: 'flex', gap: 5 }}>
            <Button variant="text" color="primary" size="small" onClick={() => {
              setOpenViewModal(true)
              setSelectedProductId(params.row._id as string)
            }}><Eye /></Button>
            <Button variant="text" style={{ color: '#FFC107' }} size="small" onClick={() => {
              setOpenEditModal(true)
              setSelectedProductId(params.row._id as string)
            }}><Pencil /></Button>
            <Button variant="text" color="error" size="small" onClick={() => {
              setOpenDeleteModal(true)
              setSelectedProductId(params.row._id as string)
            }}><Trash /></Button>
          </div>
        )
      }
    },
  ]

  if (loading) return <p>Cargando...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Productos </h1>
      <ExportImportButtons 
        module="products" 
        moduleLabel="Productos"
        onImportSuccess={() => fetch()}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateModal(true)}
      >
        Agregar Producto
      </Button>
      <ProductsCreateModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} />
      <ProductsViewModal open={openViewModal} onClose={() => setOpenViewModal(false)} productId={selectedProductId} />
      <ProductsEditModal open={openEditModal} onClose={() => setOpenEditModal(false)} productId={selectedProductId} />
      <DeleteModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        title="Eliminar Producto"
        description="¿Estás seguro de querer eliminar este producto?"
        cancelButtonText="Cancelar"
        confirmButtonText="Confirmar"
        onCancel={() => setOpenDeleteModal(false)}
        onConfirm={() => {
          deleteProduct(selectedProductId as string)
            .then(() => {
              fetch()
                .catch((err) => {
                  console.error("Error deleting product:", err)
                })
                .finally(() => {
                  setOpenDeleteModal(false)
                })
            })
        }}
      />
      <div className="mt-4" style={{ height: 750 }}>
        <DataGrid
          sx={{
            '& .MuiDataGrid-columnHeader.stock-column': {
              backgroundColor: '#568748 !important',
              color: 'white !important',
            },
            '& .MuiDataGrid-cell.stock-column': {
              backgroundColor: '#bdd6b8 !important',
              color: '#3b5736 !important',
            },
          }}
          rows={items ? items.map(p => ({
            ...p,
            // @ts-expect-error: Accessing snake_case property from an untyped object that might have it
            category_name: p.category_id?.name ?? "",
            // @ts-expect-error: Accessing snake_case property from an untyped object that might have it
            unit_name: p.unit_id?.name ?? "",
            currentStock: p.currentStock ?? 0
          }))
            : []}
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
