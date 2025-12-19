import type { SaleItem } from "@/services/api/saleItems";
import type { Sale } from "@/services/api/sales";
import { getSale } from "@/services/api/sales";
import { getSaleItemsBySaleId } from "@/services/api/saleItems";
import { Box, Modal } from "@mui/material";
import { useEffect, useState } from "react";

interface SalesViewModalProps {
  open: boolean;
  onClose: () => void;
  saleId: string | null;
}

export default function SalesViewModal({ open, onClose, saleId }: SalesViewModalProps) {
  const [sale, setSale] = useState<Sale | null>(null);
  const [saleItems, setSaleItems] = useState<SaleItem[] | null>(null);

  useEffect(() => {
    if (saleId) {
      getSale(saleId)
        .then((res) => {
          if (res.success) {
            setSale(res.data);
            console.log("sale", res.data);
          } else {
            console.error("Error fetching sale:", res.message);
            setSale(null);
          }
        })
        .catch((err) => {
          console.error("Error fetching sale:", err);
          setSale(null);
        })
    }

    if (saleId) {
      getSaleItemsBySaleId(saleId)
        .then((res) => {
          if (res.success) {
            console.log("res.data.map", res.data);
            setSaleItems(res.data?.map((item: SaleItem) => ({
              ...item,
              productName: item.product_id?.name || "N/A",
              unitName: item.unit_id?.name || "N/A",
              unitPrice: item.unit_price || 0,
              subtotal: item.subtotal || 0,
            })) || []);
            console.log("sale items", saleItems);
          } else {
            console.error("Error fetching sale items:", res.message);
            setSaleItems(null);
          }
        })
        .catch((err) => {
          console.error("Error fetching sale items:", err);
          setSaleItems(null);
        })
    }
  }, [saleId]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Ver Venta</h2>
        <table className="w-full text-sm leading-5" style={{ width: '50%', margin: '0 auto' }}>
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-medium text-gray-600">Concepto</th>
              <th className="py-3 px-4 text-left font-medium text-gray-600">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-3 px-4 text-left font-medium text-gray-600">Cliente</td>
              <td className="py-3 px-4 text-left font-medium text-gray-600">{sale?.customer_name || "N/A"}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-left font-medium text-gray-600">Documento de cliente</td>
              <td className="py-3 px-4 text-left font-medium text-gray-600">{sale?.customer_document || "N/A"}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-left font-medium text-gray-600">Método de pago</td>
              <td className="py-3 px-4 text-left font-medium text-gray-600">{sale?.payment_method}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-left font-medium text-gray-600">Monto total</td>
              <td className="py-3 px-4 text-left font-medium text-gray-600">{sale?.total_amount}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-left font-medium text-gray-600">Notas</td>
              <td className="py-3 px-4 text-left font-medium text-gray-600">{sale?.notes || "N/A"}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-left font-medium text-gray-600">Fecha de creación</td>
              <td className="py-3 px-4 text-left font-medium text-gray-600">{(sale?.created_at ? new Date(sale.created_at).toLocaleDateString() : "N/A")}</td>
            </tr>
            <tr>
              <td className="py-3 px-4 text-left font-medium text-gray-600">Fecha de actualización</td>
              <td className="py-3 px-4 text-left font-medium text-gray-600">{(sale?.updated_at ? new Date(sale.updated_at).toLocaleDateString() : "N/A")}</td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-xl font-bold mb-4 text-center mt-4">Items de la venta</h2>
        <table className="w-full text-sm leading-5">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left font-medium text-gray-600">Producto</th>
              <th className="py-3 px-4 text-left font-medium text-gray-600">Cantidad</th>
              <th className="py-3 px-4 text-left font-medium text-gray-600">Unidad de medida</th>
              <th className="py-3 px-4 text-left font-medium text-gray-600">Precio unitario</th>
              <th className="py-3 px-4 text-left font-medium text-gray-600">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {saleItems?.map((item) => (
              <tr key={item._id}>
                <td className="py-3 px-4 text-left font-medium text-gray-600">{item.productName}</td>
                <td className="py-3 px-4 text-left font-medium text-gray-600">{item.quantity}</td>
                <td className="py-3 px-4 text-left font-medium text-gray-600">{item.unitName}</td>
                <td className="py-3 px-4 text-left font-medium text-gray-600">{item.unitPrice}</td>
                <td className="py-3 px-4 text-left font-medium text-gray-600">{item.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Modal>
  )
}