import { useEffect, useState } from 'react'
import { DataGrid, type GridRenderCellParams, type GridRowHeightParams } from '@mui/x-data-grid'
import { Button, Typography } from '@mui/material'
import { useProductFormulasStore } from '@/store/productFormulasStore'
import ProductFormulasCreateModal from './createModal'
import { useProductsStore } from '@/store/productsStore'
import { useUnitsOfMeasureStore } from '@/store/unitsOfMeasureStore'
import { SquareDot } from 'lucide-react'


export default function ProductFormulasPage() {
  const { items: productFormulas, fetch: fetchProductFormulas, loading } = useProductFormulasStore()
  const [openCreateModal, setOpenCreateModal] = useState(false)
  const { items: productItems, fetch: fetchProducts } = useProductsStore();
  const { items: unitOfMeasureItems, fetch: fetchUnitsOfMeasure } = useUnitsOfMeasureStore();
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
