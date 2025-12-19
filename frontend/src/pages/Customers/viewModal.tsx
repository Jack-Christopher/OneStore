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

  useEffect(() => {
    if (customerId) {
      getCustomer(customerId)
        .then((res) => {
          if (res.success) {
            setCustomer(res.data)
          } else {
            console.error("Error fetching customer:", res.message)
            setCustomer(null)
          }
        })
        .catch((err) => {
          console.error("Error fetching customer:", err)
          setCustomer(null)
        })
    }
  }, [customerId])

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
        <h2 className="text-2xl font-bold mb-4 text-center">Ver Cliente</h2>
        <div className="border border-gray-300 shadow-sm rounded-lg overflow-hidden max-w-sm mx-auto mt-16">
          <table className="w-full text-sm leading-5">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Concepto</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Nombre</td>
                <td className="py-3 px-4 text-left">{customer?.name || '-'}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Documento (RUC/DNI)</td>
                <td className="py-3 px-4 text-left">{customer?.document || '-'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Teléfono</td>
                <td className="py-3 px-4 text-left">{customer?.phone || '-'}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Email</td>
                <td className="py-3 px-4 text-left">{customer?.email || '-'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Dirección</td>
                <td className="py-3 px-4 text-left">{customer?.address || '-'}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Activo</td>
                <td className="py-3 px-4 text-left">
                  {(customer as any)?.is_active !== undefined ? ((customer as any).is_active ? 'Sí' : 'No') : (customer?.isActive ? 'Sí' : 'No')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Box>
    </Modal>
  );
}
