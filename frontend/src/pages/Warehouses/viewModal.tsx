import { useEffect, useState } from "react";
import { Box, Button, Modal } from "@mui/material";
import { getWarehouse } from "@/services/api/warehouses";
import type { Warehouse } from "@/services/api/warehouses";

interface WarehousesViewModalProps {
  open: boolean;
  onClose: () => void;
  warehouseId: string | null;
}

export default function WarehousesViewModal({ open, onClose, warehouseId }: WarehousesViewModalProps) {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
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
    if (warehouseId && open) {
      setLoading(true);
      getWarehouse(warehouseId)
        .then((res) => {
          if (res.success && res.data) {
            setWarehouse(res.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [warehouseId, open]);

  if (loading) return null;

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Ver Bodega</h2>

        {warehouse && (
          <div className="flex flex-col gap-2">
            <p><strong>Nombre:</strong> {warehouse.name}</p>
            <p><strong>Dirección:</strong> {warehouse.address || '-'}</p>
            <p><strong>Teléfono:</strong> {warehouse.phone || '-'}</p>
            <p><strong>Activa:</strong> {(warehouse as any).is_active ? 'Sí' : 'No'}</p>
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

