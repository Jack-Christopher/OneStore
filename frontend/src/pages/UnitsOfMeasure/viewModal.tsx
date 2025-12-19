import { Box, Modal } from "@mui/material";
import { useEffect, useState } from "react";
import { getUnitOfMeasure } from "@/services/api/unitsOfMeasure";
import type { UnitOfMeasure } from "@/services/api/unitsOfMeasure";
import type { ApiResponse } from "@/types/api";

interface UnitsOfMeasureViewModalProps {
  open: boolean;
  onClose: () => void;
  unitOfMeasureId: string | null;
}

export default function UnitsOfMeasureViewModal({ open, onClose, unitOfMeasureId }: UnitsOfMeasureViewModalProps) {
  const [unitOfMeasure, setUnitOfMeasure] = useState<UnitOfMeasure | null>(null);

  useEffect(() => {
    if (unitOfMeasureId) {
    getUnitOfMeasure(unitOfMeasureId as string)
        .then((res: ApiResponse<UnitOfMeasure>) => {
          setUnitOfMeasure(res.data);
        });
    }
  }, [unitOfMeasureId]);

  if (!unitOfMeasure) return null;
  
  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center" >
      <Box sx={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: 24,
        width: 600,
        maxHeight: '80vh',
        overflowY: 'auto',
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Ver Unidad de Medida</h2>
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
                <td className="py-3 px-4 text-left">{unitOfMeasure.name}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Código</td>
                <td className="py-3 px-4 text-left">{unitOfMeasure.code}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Descripción</td>
                <td className="py-3 px-4 text-left">{unitOfMeasure.description}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Creado el</td>
                <td className="py-3 px-4 text-left">{new Date(unitOfMeasure.created_at).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Actualizado el</td>
                <td className="py-3 px-4 text-left">{new Date(unitOfMeasure.updated_at).toLocaleDateString()}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Creado por</td>
                <td className="py-3 px-4 text-left">{unitOfMeasure.created_by || 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Actualizado por</td>
                <td className="py-3 px-4 text-left">{unitOfMeasure.updated_by || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Box>
    </Modal>
  )
}