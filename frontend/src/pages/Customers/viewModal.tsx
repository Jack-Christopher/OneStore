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
        bgcolor: 'var(--card)',
        color: 'var(--card-foreground)',
        border: '2px solid var(--border)',
        boxShadow: 24,
        p: 4,
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center text-card-foreground">Ver Cliente</h2>
        <div className="border border-border shadow-sm rounded-lg overflow-hidden max-w-sm mx-auto mt-4 bg-card">
          <table className="w-full text-sm leading-5">
            <thead className="bg-muted">
              <tr>
                <th className="py-3 px-4 text-left font-medium text-muted-foreground">Concepto</th>
                <th className="py-3 px-4 text-left font-medium text-muted-foreground">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="py-3 px-4 text-left font-medium text-muted-foreground">Nombre</td>
                <td className="py-3 px-4 text-left text-card-foreground">{customer?.name || '-'}</td>
              </tr>
              <tr className="border-t border-border">
                <td className="py-3 px-4 text-left font-medium text-muted-foreground">Documento (RUC/DNI)</td>
                <td className="py-3 px-4 text-left text-card-foreground">{customer?.document || '-'}</td>
              </tr>
              <tr className="border-t border-border">
                <td className="py-3 px-4 text-left font-medium text-muted-foreground">Teléfono</td>
                <td className="py-3 px-4 text-left text-card-foreground">{customer?.phone || '-'}</td>
              </tr>
              <tr className="border-t border-border">
                <td className="py-3 px-4 text-left font-medium text-muted-foreground">Email</td>
                <td className="py-3 px-4 text-left text-card-foreground">{customer?.email || '-'}</td>
              </tr>
              <tr className="border-t border-border">
                <td className="py-3 px-4 text-left font-medium text-muted-foreground">Dirección</td>
                <td className="py-3 px-4 text-left text-card-foreground">{customer?.address || '-'}</td>
              </tr>
              <tr className="border-t border-border">
                <td className="py-3 px-4 text-left font-medium text-muted-foreground">Activo</td>
                <td className="py-3 px-4 text-left">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${(customer as any)?.is_active ? 'bg-secondary text-secondary-foreground' : 'bg-accent text-accent-foreground'}`}>
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
