import { useEffect, useState } from "react";
import { Box, Modal } from "@mui/material";
import { getCustomer } from "@/services/api/customers";
import type { Customer } from "@/services/api/customers";

interface CustomersViewModalProps {
  open: boolean;
  onClose: () => void;
  customerId: string | null;
}

export default function CustomersViewModal({ open, onClose, customerId }: CustomersViewModalProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customerId && open) {
      setLoading(true);
      getCustomer(customerId)
        .then((res) => {
          if (res.success && res.data) {
            setCustomer(res.data);
          } else {
            console.error("Error fetching customer:", res.message);
            setCustomer(null);
          }
        })
        .catch((err) => {
          console.error("Error fetching customer:", err);
          setCustomer(null);
        })
        .finally(() => setLoading(false));
    }
  }, [customerId, open]);

  if (loading) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Ver Cliente</h2>
        <div className="border border-gray-300 shadow-sm rounded-lg overflow-hidden max-w-sm mx-auto mt-4">
          <table className="w-full text-sm leading-5">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Concepto</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Nombre</td>
                <td className="py-3 px-4 text-left">{customer?.name || '-'}</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Documento</td>
                <td className="py-3 px-4 text-left">{customer?.document || '-'}</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Teléfono</td>
                <td className="py-3 px-4 text-left">{customer?.phone || '-'}</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Email</td>
                <td className="py-3 px-4 text-left">{customer?.email || '-'}</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Dirección</td>
                <td className="py-3 px-4 text-left">{customer?.address || '-'}</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="py-3 px-4 text-left font-medium text-gray-600">RUC</td>
                <td className="py-3 px-4 text-left">{customer?.ruc || '-'}</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Activo</td>
                <td className="py-3 px-4 text-left">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${(customer as any)?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {(customer as any)?.is_active ? 'Sí' : 'No'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Box>
    </Modal>
  );
}
