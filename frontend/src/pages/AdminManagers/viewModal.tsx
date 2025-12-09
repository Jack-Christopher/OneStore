import { Modal } from "@mui/material"
import { Box } from "@mui/material"
import { useState } from "react"
import type { Manager } from "@/services/api/admin"

interface AdminManagersViewModalProps {
  open: boolean;
  onClose: () => void;
  managerId: string | null;
  manager?: Manager;
}

const AdminManagersViewModal = ({ open, onClose, managerId, manager: propManager }: AdminManagersViewModalProps) => {
  const [manager] = useState<Manager | null>(propManager || null)

  // Note: En un sistema real, aquí harías un fetch del manager por ID
  // Por ahora, asumimos que el manager se pasa como prop

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box sx={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: 24,
        width: 600,
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Ver Manager</h2>
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
                <td className="py-3 px-4 text-left font-medium text-gray-600">Email</td>
                <td className="py-3 px-4 text-left">{manager?.email || 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Nombre Completo</td>
                <td className="py-3 px-4 text-left">{manager?.full_name || 'N/A'}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Estado</td>
                <td className="py-3 px-4 text-left">
                  <span className={manager?.is_active ? 'text-green-600' : 'text-red-600'}>
                    {manager?.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Creado el</td>
                <td className="py-3 px-4 text-left">{manager?.created_at ? new Date(manager.created_at).toLocaleDateString() : 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Box>
    </Modal>
  )
}

export default AdminManagersViewModal;

