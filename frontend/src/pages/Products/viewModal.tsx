import type { Product } from "@/services/api/products";
import { getProduct } from "@/services/api/products";
import { Box, Modal } from "@mui/material";
import { useEffect, useState } from "react";

interface ProductsViewModalProps {
    open: boolean;
    onClose: () => void;
    productId: string | null;
}

export default function ProductsViewModal({ open, onClose, productId }: ProductsViewModalProps) {
    const [product, setProduct] = useState<Product | null>(null)

    useEffect(() => {
        if (productId) {
          getProduct(productId)
            .then((res) => {
              if (res.success) {
                setProduct(res.data)
                console.log("product", res.data)
              } else {
                console.error("Error fetching product:", res.message)
                setProduct(null)
              }
            })
            .catch((err) => {
              console.error("Error fetching product:", err)
              setProduct(null)
            })
        }
      }, [productId])
    

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
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
            }}>
                <h2 className="text-2xl font-bold mb-4 text-center">Ver Producto</h2>
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
                                <td className="py-3 px-4 text-left">{product?.name}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-left font-medium text-gray-600">Categoría</td>
                                <td className="py-3 px-4 text-left">{product?.category_id?.name}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-left font-medium text-gray-600">Unidad</td>
                                <td className="py-3 px-4 text-left">{product?.unit_id?.name}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-left font-medium text-gray-600">Sub-unidades por unidad</td>
                                <td className="py-3 px-4 text-left">{product?.subUnitsPerUnit || (product as any)?.sub_units_per_unit || 1}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-left font-medium text-gray-600">Descripción</td>
                                <td className="py-3 px-4 text-left">{product?.description}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-left font-medium text-gray-600">SKU</td>
                                <td className="py-3 px-4 text-left">{product?.sku}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-left font-medium text-gray-600">Precio de compra</td>
                                <td className="py-3 px-4 text-left">{product?.purchase_price}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-left font-medium text-gray-600">Precio de venta</td>
                                <td className="py-3 px-4 text-left">{product?.sale_price}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-left font-medium text-gray-600">Stock mínimo</td>
                                <td className="py-3 px-4 text-left">{product?.min_stock}</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-left font-medium text-gray-600">Stock máximo</td>
                                <td className="py-3 px-4 text-left">{product?.max_stock}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Box>
        </Modal>
    )
}