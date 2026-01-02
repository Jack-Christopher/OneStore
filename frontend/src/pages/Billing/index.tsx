import { useEffect, useState, useRef } from 'react'
import { DataGrid, type GridRenderCellParams, type GridColDef } from '@mui/x-data-grid'
import { Button, Box } from '@mui/material'
import { useBillingStore } from '@/store/billingStore'
import { Eye, Upload } from 'lucide-react'
import type { BillingDocumentType } from '@/services/api/billing'
import Select, { type SelectOption } from '@/components/Select'
import BillingViewModal from './viewModal'
import BillingImportModal from './importModal'
import { formatCurrency } from '@/utils/currency'

const documentTypeOptions: SelectOption[] = [
  { value: 'invoice', label: 'Facturas' },
  { value: 'sale_ticket', label: 'Boletas de venta' },
  { value: 'credit_note', label: 'Notas de crédito' },
  { value: 'debit_note', label: 'Notas de débito' },
  { value: 'sale_note', label: 'Notas de venta' },
  { value: 'proforma', label: 'Proformas' },
];

export default function BillingPage() {
  const { items, fetch, loading, documentType, setDocumentType } = useBillingStore()
  const [openViewModal, setOpenViewModal] = useState(false)
  const [openImportModal, setOpenImportModal] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const [selectedDocumentType, setSelectedDocumentType] = useState<BillingDocumentType | null>(null)

  // Fetch data when document type changes
  useEffect(() => {
    if (documentType) {
      fetch(documentType).catch((err) => {
        console.error("Error fetching billing documents:", err)
      })
    }
  }, [documentType, fetch])

  const handleDocumentTypeChange = (value: string) => {
    if (value) {
      setDocumentType(value as BillingDocumentType)
    } else {
      setDocumentType(null)
    }
  }

  // Build columns dynamically based on document type
  const getColumns = (): GridColDef[] => {
    const baseColumns: GridColDef[] = [
      { field: 'serie', headerName: 'Serie', width: 100 },
      { field: 'numero', headerName: 'Número', width: 120 },
      { field: 'sucursal', headerName: 'Sucursal', flex: 1 },
      { field: 'cliente_nombre', headerName: 'Cliente', flex: 1 },
      { field: 'cliente_doc', headerName: 'Cliente DOC', width: 150 },
      {
        field: 'fecha_emision',
        headerName: 'Fecha Emisión',
        width: 130,
        renderCell: (params: GridRenderCellParams) => {
          if (!params.value) return '-'
          const date = new Date(params.value)
          return date.toLocaleDateString('es-PE')
        }
      },
      {
        field: 'total',
        headerName: 'Total',
        width: 120,
        renderCell: (params: GridRenderCellParams) => formatCurrency(params.value || 0)
      },
      {
        field: 'anulado',
        headerName: 'Anulado',
        width: 100,
        renderCell: (params: GridRenderCellParams) => params.value === 'SI' ? 'Sí' : 'No'
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 120,
        renderCell: (params: GridRenderCellParams) => {
          return (
            <div style={{ display: 'flex', gap: 5 }}>
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => {
                  setSelectedDocumentId(params.row._id as string)
                  setSelectedDocumentType(documentType!)
                  setOpenViewModal(true)
                }}
              >
                <Eye />
              </Button>
            </div>
          )
        }
      },
    ]

    // Add type-specific columns
    if (documentType === 'invoice' || documentType === 'sale_ticket') {
      baseColumns.splice(7, 0,
        { field: 'cond_pago', headerName: 'Cond. Pago', width: 120 },
        { field: 'met_pago', headerName: 'Mét. Pago', width: 120 },
        { field: 'estado_sunat', headerName: 'Estado SUNAT', flex: 1 }
      )
    }

    if (documentType === 'credit_note' || documentType === 'debit_note') {
      baseColumns.splice(7, 0,
        { field: 'documento_afectado', headerName: 'Doc. Afectado', width: 150 },
        { field: 'motivo', headerName: 'Motivo', flex: 1 }
      )
    }

    return baseColumns
  }

  const refreshData = () => {
    if (documentType) {
      fetch(documentType).catch((err) => {
        console.error("Error refreshing billing documents:", err)
      })
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Facturación</h1>
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <Box sx={{ minWidth: 250 }}>
          <Select
            options={documentTypeOptions}
            setFormInput={handleDocumentTypeChange}
            value={documentType || ''}
          />
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Upload />}
          onClick={() => setOpenImportModal(true)}
        >
          Importar desde Keyfacil
        </Button>
      </Box>

      {loading && <p>Cargando...</p>}

      {documentType && !loading && (
        <div className="mt-4 datagrid-theme" style={{ height: 750 }}>
          <DataGrid
            showToolbar={false}
            disableColumnMenu={true}
            disableRowSelectionOnClick
            rows={items || []}
            columns={getColumns()}
            localeText={{
              noRowsLabel: `Aún no hay ${documentTypeOptions.find(o => o.value === documentType)?.label.toLowerCase()} registrados.`,
            }}
            getRowId={(row) => row._id}
          />
        </div>
      )}

      {!documentType && !loading && (
        <p className="text-muted-foreground">Selecciona un tipo de documento para comenzar.</p>
      )}

      <BillingViewModal
        open={openViewModal}
        onClose={() => {
          setOpenViewModal(false)
          setSelectedDocumentId(null)
          setSelectedDocumentType(null)
        }}
        documentId={selectedDocumentId}
        documentType={selectedDocumentType}
      />

      <BillingImportModal
        open={openImportModal}
        onClose={() => setOpenImportModal(false)}
        onSuccess={() => {
          setOpenImportModal(false)
          refreshData()
        }}
        documentType={documentType || undefined}
      />
    </div>
  )
}

