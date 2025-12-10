import { useEffect, useState } from "react";
import { Box, Button, Modal } from "@mui/material";
import { getSupplier } from "@/services/api/suppliers";
import type { Supplier } from "@/services/api/suppliers";

interface SuppliersViewModalProps {
  open: boolean;
  onClose: () => void;
  supplierId: string | null;
}

export default function SuppliersViewModal({ open, onClose, supplierId }: SuppliersViewModalProps) {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);

  const boxStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '80vh',
    overflowY: 'auto',
  };

  useEffect(() => {
    if (supplierId && open) {
      setLoading(true);
      getSupplier(supplierId)
        .then((res) => {
          if (res.success && res.data) {
            setSupplier(res.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [supplierId, open]);

  if (loading) return null;

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Ver Proveedor</h2>

        {supplier && (
          <div className="flex flex-col gap-2">
            <p><strong>Nombre:</strong> {supplier.name}</p>
            <p><strong>Contacto:</strong> {(supplier as any).contact_name || '-'}</p>
            <p><strong>Documento (RUC/DNI):</strong> {supplier.document || '-'}</p>
            <p><strong>Teléfono:</strong> {supplier.phone || '-'}</p>
            <p><strong>Email:</strong> {supplier.email || '-'}</p>
            <p><strong>Dirección:</strong> {supplier.address || '-'}</p>
          </div>
        )}

        <div className="flex justify-center mt-4">
          <Button variant="contained" color="primary" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </Box>
    </Modal>
  );
}

