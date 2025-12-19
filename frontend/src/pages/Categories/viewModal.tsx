import { getCategory, type Category } from "@/services/api/categories";
import { Modal } from "@mui/material"
import { Box } from "@mui/material"
import { useEffect, useState } from "react"

interface CategoriesViewModalProps {
  open: boolean;
  onClose: () => void;
  categoryId: string | null;
}

const CategoriesViewModal = ({ open, onClose, categoryId }: CategoriesViewModalProps) => {
  const [category, setCategory] = useState<Category | null>(null)

  useEffect(() => {
    if (categoryId) {
      getCategory(categoryId)
        .then((res) => {
          if (res.success) {
            setCategory(res.data)
          } else {
            console.error("Error fetching category:", res.message)
            setCategory(null)
          }
        })
        .catch((err) => {
          console.error("Error fetching category:", err)
          setCategory(null)
        })
    }
  }, [categoryId])

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
        <h2 className="text-2xl font-bold mb-4 text-center">Ver Categoría</h2>
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
                <td className="py-3 px-4 text-left">{category?.name}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Descripción</td>
                <td className="py-3 px-4 text-left">{category?.description}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Creado el</td>
                <td className="py-3 px-4 text-left">{new Date(category?.created_at).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Actualizado el</td>
                <td className="py-3 px-4 text-left">{new Date(category?.updated_at).toLocaleDateString()}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="py-3 px-4 text-left font-medium text-gray-600">Creado por</td>
                <td className="py-3 px-4 text-left">{category?.created_by || 'N/A'}</td> 
              </tr>
              <tr>
                <td className="py-3 px-4 text-left font-medium text-gray-600">Actualizado por</td>
                <td className="py-3 px-4 text-left">{category?.updated_by || 'N/A'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Box>
    </Modal>
  )
}

export default CategoriesViewModal;