import { useEffect, useState } from "react";
import { Box, Button, Modal, Chip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getPurchaseOrder, getPurchaseOrderItems } from "@/services/api/purchaseOrders";
import type { PurchaseOrder, PurchaseOrderItem } from "@/services/api/purchaseOrders";

interface PurchaseOrdersViewModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
}

export default function PurchaseOrdersViewModal({ open, onClose, orderId }: PurchaseOrdersViewModalProps) {
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [loading, setLoading] = useState(false);

  const boxStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '80vh',
    overflowY: 'auto',
  };

  useEffect(() => {
    if (orderId && open) {
      setLoading(true);
      Promise.all([
        getPurchaseOrder(orderId),
        getPurchaseOrderItems(orderId)
      ])
        .then(([orderRes, itemsRes]) => {
          if (orderRes.success && orderRes.data) {
            setOrder(orderRes.data);
          }
          if (itemsRes.success && itemsRes.data) {
            setItems(itemsRes.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [orderId, open]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'received': return 'success';
      case 'canceled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'received': return 'Recibida';
      case 'canceled': return 'Cancelada';
      default: return status;
    }
  };

  const itemColumns = [
    { field: 'product_id', headerName: 'Producto ID', flex: 1 },
    { field: 'quantity', headerName: 'Cantidad', flex: 0.5 },
    { field: 'unit_price', headerName: 'Precio Unit.', flex: 0.5 },
    { field: 'subtotal', headerName: 'Subtotal', flex: 0.5 },
    { field: 'received_quantity', headerName: 'Recibido', flex: 0.5 },
  ];

  if (loading) return null;

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Detalle de Orden de Compra</h2>

        {order && (
          <div className="flex flex-col gap-2 mb-4">
            <p><strong>Referencia:</strong> {(order as any).reference_number || '-'}</p>
            <p><strong>Estado:</strong> <Chip label={getStatusLabel((order as any).status)} color={getStatusColor((order as any).status)} size="small" /></p>
            <p><strong>Monto Total:</strong> ${((order as any).total_amount || 0).toFixed(2)}</p>
            <p><strong>Notas:</strong> {(order as any).notes || '-'}</p>
          </div>
        )}

        <h3 className="text-lg font-semibold mb-2">Items</h3>
        <div className="datagrid-theme" style={{ height: 300 }}>
          <DataGrid
            rows={items}
            columns={itemColumns}
            localeText={{
              noRowsLabel: "No hay items en esta orden.",
            }}
            getRowId={(row) => row._id}
            pageSizeOptions={[5, 10]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 5 },
              },
            }}
          />
        </div>

        <div className="flex justify-center mt-4">
          <Button variant="contained" color="primary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </Box>
    </Modal>
  );
}

