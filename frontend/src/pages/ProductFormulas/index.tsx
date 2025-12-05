import { useEffect, useState } from 'react'
import { DataGrid, type GridRenderCellParams, type GridRowHeightParams } from '@mui/x-data-grid'
import { Button, Typography } from '@mui/material'
import { useProductFormulasStore } from '@/store/productFormulasStore'
import ProductFormulasCreateModal from './createModal'
import { useProductsStore } from '@/store/productsStore'
import { useUnitsOfMeasureStore } from '@/store/unitsOfMeasureStore'
import { Eye, Pencil, SquareDot, Trash } from 'lucide-react'
import ProductFormulasViewModal from './viewModal'
import DeleteModal from '@/components/DeleteModal'
import { deleteProductFormula } from '@/services/api/productFormulas'
import ProductFormulasEditModal from './editModal'


export default function ProductFormulasPage() {
  const { items: productFormulas, fetch: fetchProductFormulas, loading } = useProductFormulasStore()
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const { items: productItems, fetch: fetchProducts } = useProductsStore();
  const { items: unitOfMeasureItems, fetch: fetchUnitsOfMeasure } = useUnitsOfMeasureStore();
  const [openViewModal, setOpenViewModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  const [productFormulaId, setProductFormulaId] = useState<string | null>(null)

  useEffect(() => {
    fetchProductFormulas()
      .then(() => {
        console.log("Product formulas fetched", productFormulas)
      })
      .catch((err) => {
        console.error("Error fetching product formulas:", err)
      })
  }, [productFormulas.length, fetchProductFormulas]);

  useEffect(() => {
    fetchProducts()
      .then(() => {
        console.log("Products fetched", productItems);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }, [productItems.length, fetchProducts]);

  useEffect(() => {
    fetchUnitsOfMeasure()
      .then(() => {
        console.log("Units of measure fetched", unitOfMeasureItems);
      })
      .catch((err) => {
        console.error("Error fetching units of measure:", err);
      });
  }, [unitOfMeasureItems.length, fetchUnitsOfMeasure]);

  const columns = [
    { field: '_id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    {
      field: 'items', headerName: 'Items', flex: 1, renderCell: (params: GridRenderCellParams) => {
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {params.row.items.map((item: { id: string, product_id: string, unit_id: string, quantity: number }) => (
              <div key={item.id}>
                <Typography variant="body2" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <SquareDot size={16} />
                  [{productItems.find((p) => p._id === item.product_id)?.name}]: {item.quantity} {unitOfMeasureItems.find((u) => u._id === item.unit_id)?.name}
                </Typography>
              </div>
            ))}
          </div>
        )
      }
    },
    {
      field: 'actions', headerName: 'Acciones', flex: 1, renderCell: (params: GridRenderCellParams) => {
        return (
          <div style={{ display: 'flex', gap: 5 }}>
            <Button variant="text" color="primary" size="small" onClick={() => {
              setOpenViewModal(true)
              setProductFormulaId(params.row._id as string)
            }}><Eye /></Button>
            <Button variant="text" style={{ color: '#FFC107' }} size="small" onClick={() => {
              setOpenEditModal(true)
              setProductFormulaId(params.row._id as string)
            }}><Pencil /></Button>
            <Button variant="text" color="error" size="small" onClick={() => {
              setOpenDeleteModal(true)
              setProductFormulaId(params.row._id as string)
            }}><Trash /></Button>
          </div>
        )
      }
    }
  ]

  if (loading) return <p>Cargando...</p>

  const getRowHeight = (params: GridRowHeightParams) => {
    const { id } = params as { id: string };
    const formula = productFormulas.find((p) => p._id === id);
    if (!formula) return 50;
    return formula.items.length * 30;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Fórmulas de Productos </h1>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateModal(true)}
      >
        Agregar Fórmula de Producto
      </Button>
      <ProductFormulasCreateModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} />
      <ProductFormulasViewModal open={openViewModal} onClose={() => setOpenViewModal(false)} productFormulaId={productFormulaId} />
      <ProductFormulasEditModal open={openEditModal} onClose={() => setOpenEditModal(false)} productFormulaId={productFormulaId as string} />
      <DeleteModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={() => deleteProductFormula(productFormulaId as string).then(() => {
          fetchProductFormulas()
          setOpenDeleteModal(false)
        })}
        onCancel={() => setOpenDeleteModal(false)}
        title="Eliminar Fórmula de Producto"
        description="¿Estás seguro de querer eliminar esta fórmula de producto?"
        confirmButtonText="Eliminar"
        cancelButtonText="Cancelar"
      />
      <div className="mt-4" style={{ height: 750 }}>
        <DataGrid
          rows={productFormulas ? productFormulas : []}
          columns={columns}
          localeText={{
            noRowsLabel: "Aún no hay fórmulas de productos registradas.",
          }}
          getRowId={(row) => row._id}
          getRowHeight={getRowHeight} />
      </div>
    </div>
  );
}
