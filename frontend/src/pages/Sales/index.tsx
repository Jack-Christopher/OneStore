import { useEffect, useState } from 'react'
import { DataGrid, type GridRenderCellParams } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { useSalesStore } from '@/store/salesStore'
import SalesCreateModal from './createModal'
// import { useSaleItemsStore } from '@/store/saleItemsStore'
import { Eye } from 'lucide-react'
import SalesViewModal from './viewModal'
export default function SalesPage() {
  const { items: sales, fetch: fetchSales, loading } = useSalesStore();
  // const { items: saleItems, fetch: fetchSaleItems } = useSaleItemsStore();
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);

  useEffect(() => {
    fetchSales()
      .then(() => {
        console.log("Sales fetched", sales);
      })
      .catch((err) => {
        console.error("Error fetching sales:", err)
      })
  }, [sales.length, fetch])


  // useEffect(() => {
  //   fetchSaleItems()
  //     .then(() => {
  //       console.log("Sale items fetched", saleItems);
  //     })
  //     .catch((err) => {
  //       console.error("Error fetching sales:", err)
  //     })
  // }, [saleItems.length, fetch])


  const columns = [
    { field: 'status', headerName: 'Estado', flex: 1 },
    { field: 'payment_method', headerName: 'Método de pago', flex: 1 },
    { field: 'total_amount', headerName: 'Monto Total', flex: 1 },
    { field: 'notes', headerName: 'Notas', flex: 1 },
    {
      field: 'actions', headerName: 'Acciones', width: 250, renderCell: (params: GridRenderCellParams) => {
        return (
          <div style={{ display: 'flex', gap: 5 }}>
            <Button variant="text" color="primary" size="small" onClick={() => {
              setOpenViewModal(true)
              setSelectedSaleId(params.row._id as string)
            }}><Eye /></Button>
          </div>
        )
      }
    },
  ]

  if (loading) return <p>Cargando...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Ventas </h1>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenCreateModal(true)}
      >
        Agregar Venta
      </Button>
      <SalesCreateModal 
        open={openCreateModal} 
        onClose={() => setOpenCreateModal(false)}
        onSuccess={() => fetchSales()}
      />
      <SalesViewModal open={openViewModal} onClose={() => setOpenViewModal(false)} saleId={selectedSaleId} />
      <div className="mt-4 datagrid-theme" style={{ height: 750 }}>
        <DataGrid
          showToolbar={false}
          disableColumnMenu={true}
          disableRowSelectionOnClick
          rows={sales ? sales : []}
          columns={columns}
          localeText={{
            noRowsLabel: "Aún no hay ventas registradas.",
          }}
          getRowId={(row) => row._id}
        />
      </div>
    </div>
  )
}
