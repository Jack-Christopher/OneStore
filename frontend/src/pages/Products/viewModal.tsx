import type { Product } from "@/services/api/products";
import { getProduct } from "@/services/api/products";
import { getKardex, type KardexRow } from "@/services/api/kardex";
import { productTypeLabel } from "@/constants/productTypes";
import { Box, Modal } from "@mui/material";
import { useEffect, useState } from "react";

interface ProductsViewModalProps {
    open: boolean;
    onClose: () => void;
    productId: string | null;
}

const MOVEMENT_LABELS: Record<string, string> = {
    purchase: "Compra",
    sale: "Venta",
    adjustment_in: "Ajuste entrada",
    adjustment_out: "Ajuste salida",
    transfer_in: "Transferencia entrada",
    transfer_out: "Transferencia salida",
};

export default function ProductsViewModal({ open, onClose, productId }: ProductsViewModalProps) {
    const [product, setProduct] = useState<Product | null>(null)
    const [kardex, setKardex] = useState<KardexRow[]>([])

    useEffect(() => {
        if (!productId || !open) return
        getProduct(productId)
            .then((res) => setProduct(res.success ? res.data : null))
            .catch(() => setProduct(null))
        getKardex(productId)
            .then((res) => setKardex(res.success ? res.data : []))
            .catch(() => setKardex([]))
    }, [productId, open])

    const cost = product?.purchase_price || 0
    const sale = product?.sale_price || 0
    const utility = sale - cost

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 760,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                p: 3,
                maxHeight: '85vh',
                overflowY: 'auto',
            }}>
                <h2 className="text-xl font-semibold mb-4">{product?.name || "Producto"}</h2>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-6">
                    <p>Tipo: {productTypeLabel(product?.product_type)}</p>
                    <p>SKU: {product?.sku || "-"}</p>
                    <p>Proveedor: {(product as any)?.supplier_id?.name || "-"}</p>
                    <p>Categoría: {(product as any)?.category_id?.name || "-"}</p>
                    <p>Unidad de stock: {(product as any)?.unit_id?.name || "-"}</p>
                    <p>Factor de compra: {product?.purchase_to_stock_factor || 1}</p>
                    <p>Costo: {cost}</p>
                    <p>Precio de venta: {sale}</p>
                    <p>Utilidad: {utility.toFixed(2)} {cost > 0 ? `(${((utility / cost) * 100).toFixed(1)}%)` : ""}</p>
                    <p>Precio: {product?.price_stale ? "Desactualizado" : "Al día"}</p>
                </div>
                <h3 className="text-base font-semibold mb-2">Kardex</h3>
                <div className="overflow-x-auto border border-border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-muted-foreground">
                                <th className="py-2 px-2">Fecha</th>
                                <th className="py-2 px-2">Movimiento</th>
                                <th className="py-2 px-2">Cantidad</th>
                                <th className="py-2 px-2">Costo</th>
                                <th className="py-2 px-2">Saldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {kardex.length === 0 && (
                                <tr><td className="py-3 px-2" colSpan={5}>Sin movimientos</td></tr>
                            )}
                            {kardex.map((row) => (
                                <tr key={row._id} className="border-b border-border">
                                    <td className="py-2 px-2">{row.created_at ? new Date(row.created_at).toLocaleString("es-PE") : "-"}</td>
                                    <td className="py-2 px-2">{MOVEMENT_LABELS[row.movement_type] || row.movement_type}</td>
                                    <td className="py-2 px-2">{row.quantity}</td>
                                    <td className="py-2 px-2">{row.unit_cost_base ?? "-"}</td>
                                    <td className="py-2 px-2">{row.balance}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Box>
        </Modal>
    )
}
