import type { BillingDocument } from "@/services/api/billing";
import { getBillingDocument } from "@/services/api/billing";
import { Box, Modal } from "@mui/material";
import { useEffect, useState } from "react";
import type { BillingDocumentType } from "@/services/api/billing";
import { formatCurrency } from "@/utils/currency";

interface BillingViewModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string | null;
  documentType: BillingDocumentType | null;
}

export default function BillingViewModal({ open, onClose, documentId, documentType }: BillingViewModalProps) {
  const [document, setDocument] = useState<BillingDocument | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (documentId && documentType) {
      setLoading(true);
      getBillingDocument(documentType, documentId)
        .then((res) => {
          if (res.success) {
            setDocument(res.data);
          } else {
            console.error("Error fetching document:", res.message);
            setDocument(null);
          }
        })
        .catch((err) => {
          console.error("Error fetching document:", err);
          setDocument(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [documentId, documentType]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const renderField = (label: string, value: any, formatValue?: (val: any) => string) => {
    if (value === null || value === undefined || value === '') return null;
    
    const displayValue = formatValue ? formatValue(value) : value;
    
    return (
      <tr key={label}>
        <td className="py-2 px-4 text-left font-medium text-gray-600">{label}</td>
        <td className="py-2 px-4 text-left">{displayValue}</td>
      </tr>
    );
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 800,
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Ver Documento</h2>
        
        {loading && <p className="text-center">Cargando...</p>}
        
        {!loading && document && (
          <div className="border border-gray-300 shadow-sm rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left font-medium text-gray-600">Campo</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600">Valor</th>
                </tr>
              </thead>
              <tbody>
                {renderField('Serie', document.serie)}
                {renderField('Número', document.numero)}
                {renderField('Sucursal', document.sucursal)}
                {renderField('Cliente Documento', document.cliente_doc)}
                {renderField('Cliente Nombre', document.cliente_nombre)}
                {renderField('Fecha Emisión', document.fecha_emision, formatDate)}
                {renderField('Fecha Vencimiento', document.fecha_vencimiento, formatDate)}
                {renderField('Fecha Creación', document.fecha_creacion, formatDate)}
                {renderField('Usuario', document.usuario)}
                {renderField('Placa Vehículo', document.placa_vehiculo)}
                {renderField('Moneda', document.moneda)}
                
                {/* Campos específicos de Invoice/SaleTicket */}
                {renderField('Orden de Compra', document.orden_compra)}
                {renderField('Guías de Remisión', document.guias_remision)}
                {renderField('Cond. de Pago', document.cond_pago)}
                {renderField('Mét. de Pago', document.met_pago)}
                {renderField('Referencia', document.referencia)}
                {renderField('Cuotas', document.cuotas)}
                
                {/* Campos específicos de CreditNote/DebitNote */}
                {renderField('Documento Afectado', document.documento_afectado)}
                {renderField('Motivo', document.motivo)}
                
                {/* Campos financieros */}
                {renderField('RC', document.rc, (v) => formatCurrency(v))}
                {renderField('Descuento', document.descuento, (v) => formatCurrency(v))}
                {renderField('Gravado', document.gravado, (v) => formatCurrency(v))}
                {renderField('Exonerado', document.exonerado, (v) => formatCurrency(v))}
                {renderField('Inafecto', document.inafecto, (v) => formatCurrency(v))}
                {renderField('Exportación', document.exportacion, (v) => formatCurrency(v))}
                {renderField('Gratuito', document.gratuito, (v) => formatCurrency(v))}
                {renderField('IGV', document.igv, (v) => formatCurrency(v))}
                {renderField('ISC', document.isc, (v) => formatCurrency(v))}
                {renderField('ICBPER', document.icbper, (v) => formatCurrency(v))}
                
                {/* Campos específicos de Invoice/SaleTicket */}
                {renderField('Detracción (PEN)', document.detraccion_pen, (v) => formatCurrency(v))}
                {renderField('Retención', document.retencion, (v) => formatCurrency(v))}
                {renderField('Percepción (PEN)', document.percepcion_pen, (v) => formatCurrency(v))}
                {renderField('Estado SUNAT', document.estado_sunat)}
                
                {renderField('Total', document.total, (v) => formatCurrency(v))}
                {renderField('Anulado', document.anulado)}
                {renderField('Observaciones', document.observaciones)}
                {renderField('Otros', document.otros)}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cerrar
          </button>
        </div>
      </Box>
    </Modal>
  );
}

