import { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { Button } from '@mui/material'
import { useUnitsOfMeasureStore } from '@/store/unitsOfMeasureStore'
import  UnitsOfMeasureCreateModal from './createModal'


export default function UnitsOfMeasurePage() {
  const { items, fetch, loading } = useUnitsOfMeasureStore()
  const [openCreateModal, setOpenCreateModal] = useState(false)

  useEffect(() => {
    fetch()
      .then(() => {
        console.log("Units Of Measure fetched", items)
      })
      .catch((err) => {
        console.error("Error fetching units of measure:", err)
      })
  }, [items.length, fetch])

  const columns = [
    { field: '_id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'code', headerName: 'Código', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
  ]

  if (loading) return <p>Cargando...</p>

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Unidades de Medida </h1>
      <Button 
      variant="contained" 
      color="primary"
      onClick={() => setOpenCreateModal(true)}
      >
        Agregar Unidad de Medida
      </Button>
      <UnitsOfMeasureCreateModal open={openCreateModal} onClose={() => setOpenCreateModal(false)} />
      <div className="mt-4" style={{ height: 750 }}>
        <DataGrid
          rows={items ? items : []}
          columns={columns}
          localeText={{
            noRowsLabel: "Aún no hay unidades de medidas registradas.",
          }}
          getRowId={(row) => row._id}
        />
      </div>
    </div>
  )
}
