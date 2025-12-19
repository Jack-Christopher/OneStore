import Alert from "@/components/Alert";
import { getProductFormula, type ProductFormula } from "@/services/api/productFormulas";
import { Box, Modal } from "@mui/material";
import { useEffect, useState } from "react";

interface ProductFormulasViewModalProps {
  open: boolean;
  onClose: () => void;
  productFormulaId: string | null;
}

export default function ProductFormulasViewModal({ open, onClose, productFormulaId }: ProductFormulasViewModalProps) {
  const [productFormula, setProductFormula] = useState<ProductFormula | null>(null)

  useEffect(() => {
    if (productFormulaId) {
      getProductFormula(productFormulaId)
        .then((res) => {
          if (res.success) {
            setProductFormula(res.data)
            console.log("product formula", res.data)
          } else {
            console.error("Error fetching product formula:", res.message)
            setProductFormula(null)
          }
        })
        .catch((err) => {
          console.error("Error fetching product formula:", err)
          setProductFormula(null)
        })
    }
  }, [productFormulaId])


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


  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Ver Fórmula de Productos</h2>

        {productFormula && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <Alert type="info" message={`Formula para: ${(productFormula as any)?.reference_quantity || productFormula.referenceQuantity} ${((productFormula as any)?.reference_unit_id as any)?.name || ''}`} />
          </div>
        )}

        {productFormula?.items.map((item, index) => (
          <div key={item.productId || index} className="border border-gray-300 shadow-sm rounded-lg overflow-hidden max-w-sm mx-auto mt-4">
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
                  <td className="py-3 px-4 text-left">{((item as any)?.product_id as any)?.name || ''}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-left font-medium text-gray-600">Unidad de medida</td>
                  <td className="py-3 px-4 text-left">{((item as any)?.unit_id as any)?.name || ''}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-left font-medium text-gray-600">Unidad</td>
                  <td className="py-3 px-4 text-left">{item.quantity}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}
      </Box>
    </Modal>
  )
}