import { useEffect, useState } from "react";
import { Box, Modal } from "@mui/material";
import { getPurchaseOrder, getPurchaseOrderItems } from "@/services/api/purchaseOrders";
import type { PurchaseOrder, PurchaseOrderItem } from "@/services/api/purchaseOrders";
import { formatCurrency } from "@/utils/currency";

interface PurchaseOrdersViewModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
}

export default function PurchaseOrdersViewModal({ open, onClose, orderId }: PurchaseOrdersViewModalProps) {
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);

  useEffect(() => {
    if (orderId) {
      Promise.all([
        getPurchaseOrder(orderId),
        getPurchaseOrderItems(orderId)
      ])
        .then(([orderRes, itemsRes]) => {
          if (orderRes.success) {
            setOrder(orderRes.data);
          }
          if (itemsRes.success) {
            setItems(itemsRes.data || []);
          }
        })
        .catch((err) => {
          console.error("Error fetching purchase order:", err);
        });
    }
  }, [orderId]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'received': return 'Recibida';
      case 'canceled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box sx={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: 24,
        width: 600,
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Detalle de Orden de Compra</h2>

        {order && (
          <div className="border border-gray-300 shadow-sm rounded-lg overflow-hidden max-w-sm mx-auto mt-16 mb-8">
            <table className="w-full text-sm leading-5">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left font-medium text-gray-600">Concepto</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-600">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-4 text-left font-medium text-gray-600">Referencia</td>
                  <td className="py-3 px-4 text-left">{(order as any).reference_number || order.referenceNumber || '-'}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-3 px-4 text-left font-medium text-gray-600">Estado</td>
                  <td className="py-3 px-4 text-left">{getStatusLabel((order as any).status || order.status)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-left font-medium text-gray-600">Monto Total</td>
                  <td className="py-3 px-4 text-left">{formatCurrency((order as any).total_amount || order.totalAmount || 0)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="py-3 px-4 text-left font-medium text-gray-600">Notas</td>
                  <td className="py-3 px-4 text-left">{(order as any).notes || order.notes || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {items.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Items</h3>
            {items.map((item, index) => (
              <div key={item._id || index} className="border border-gray-300 shadow-sm rounded-lg overflow-hidden max-w-sm mx-auto mt-4">
                <table className="w-full text-sm leading-5">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Concepto</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 px-4 text-left font-medium text-gray-600">Producto ID</td>
                      <td className="py-3 px-4 text-left">{((item as any).product_id?.name) || item.productId || '-'}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 text-left font-medium text-gray-600">Cantidad</td>
                      <td className="py-3 px-4 text-left">{item.quantity || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-left font-medium text-gray-600">Precio Unitario</td>
                      <td className="py-3 px-4 text-left">{formatCurrency((item as any).unit_price || item.unitPrice || 0)}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="py-3 px-4 text-left font-medium text-gray-600">Subtotal</td>
                      <td className="py-3 px-4 text-left">{formatCurrency(item.subtotal || 0)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-left font-medium text-gray-600">Cantidad Recibida</td>
                      <td className="py-3 px-4 text-left">{(item as any).received_quantity !== undefined ? (item as any).received_quantity : (item.receivedQuantity !== undefined ? item.receivedQuantity : 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 && (
          <div className="text-center text-gray-500 mt-4">
            No hay items en esta orden.
          </div>
        )}
      </Box>
    </Modal>
  );
}

