import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { useSalesStore } from '@/store/salesStore'
import SalesCreateModal from './createModal'
import { useSaleItemsStore } from '@/store/saleItemsStore'


export default function SalesPage() {
  const { items: sales, fetch: fetchSales, loading } = useSalesStore();
  // const { items: saleItems, fetch: fetchSaleItems } = useSaleItemsStore();
  const [openCreateModal, setOpenCreateModal] = useState(false);

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
    { field: '_id', headerName: 'ID', width: 70 },
    { field: 'status', headerName: 'Estado', flex: 1 },
    { field: 'payment_method', headerName: 'Método de pago', flex: 1 },
    { field: 'total_amount', headerName: 'Monto Total', flex: 1 },
    { field: 'notes', headerName: 'Notas', flex: 1 },
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
      <SalesCreateModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} />
      <div className="mt-4" style={{ height: 750 }}>
        <DataGrid
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
