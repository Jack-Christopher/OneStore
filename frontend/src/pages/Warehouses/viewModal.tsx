import { useEffect, useState } from "react";
import { Box, Modal } from "@mui/material";
import { getWarehouse } from "@/services/api/warehouses";
import type { Warehouse } from "@/services/api/warehouses";

interface WarehousesViewModalProps {
  open: boolean;
  onClose: () => void;
  warehouseId: string | null;
}

export default function WarehousesViewModal({ open, onClose, warehouseId }: WarehousesViewModalProps) {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);

  useEffect(() => {
    if (warehouseId) {
      getWarehouse(warehouseId)
        .then((res) => {
          if (res.success) {
            setWarehouse(res.data)
          } else {
            console.error("Error fetching warehouse:", res.message)
            setWarehouse(null)
          }
        })
        .catch((err) => {
          console.error("Error fetching warehouse:", err)
          setWarehouse(null)
        })
    }
  }, [warehouseId])

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
        <h2 className="text-2xl font-bold mb-4 text-center">Ver Bodega</h2>
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
                <td className="py-3 px-4 text-left">{warehouse?.name || '-'}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Dirección</td>
                <td className="py-3 px-4 text-left">{warehouse?.address || '-'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Teléfono</td>
                <td className="py-3 px-4 text-left">{warehouse?.phone || '-'}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Activa</td>
                <td className="py-3 px-4 text-left">
                  {(warehouse as any)?.is_active !== undefined ? ((warehouse as any).is_active ? 'Sí' : 'No') : (warehouse?.isActive ? 'Sí' : 'No')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Box>
    </Modal>
  )
}

