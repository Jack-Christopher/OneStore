import { getTenants, type Tenant } from "@/services/api/admin";
import { Modal } from "@mui/material"
import { Box } from "@mui/material"
import { useEffect, useState } from "react"

interface AdminTenantsViewModalProps {
  open: boolean;
  onClose: () => void;
  tenantId: string | null;
}

const AdminTenantsViewModal = ({ open, onClose, tenantId }: AdminTenantsViewModalProps) => {
  const [tenant, setTenant] = useState<Tenant | null>(null)

  useEffect(() => {
    if (tenantId) {
      getTenants()
        .then((res) => {
          if (res.success) {
            const found = res.data.find((t: Tenant) => t._id === tenantId)
            setTenant(found || null)
          } else {
            console.error("Error fetching tenant:", res.message)
            setTenant(null)
          }
        })
        .catch((err) => {
          console.error("Error fetching tenant:", err)
          setTenant(null)
        })
    }
  }, [tenantId])

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box sx={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: 24,
        width: 600,
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Ver Tenant</h2>
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
                <td className="py-3 px-4 text-left">{tenant?.name}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Razón Social</td>
                <td className="py-3 px-4 text-left">{tenant?.legal_name || 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Email</td>
                <td className="py-3 px-4 text-left">{tenant?.email || 'N/A'}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Teléfono</td>
                <td className="py-3 px-4 text-left">{tenant?.phone || 'N/A'}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Dirección</td>
                <td className="py-3 px-4 text-left">{tenant?.address || 'N/A'}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Estado</td>
                <td className="py-3 px-4 text-left">
                  <span className={tenant?.is_active ? 'text-green-600' : 'text-red-600'}>
                    {tenant?.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Creado el</td>
                <td className="py-3 px-4 text-left">{tenant?.created_at ? new Date(tenant.created_at).toLocaleDateString() : 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Box>
    </Modal>
  )
}

export default AdminTenantsViewModal;

