import { Box, Button, Modal } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import Input from "@/components/Input";
import Alert from "@/components/Alert";
import { adjustProductStock } from "@/services/api/products";

interface ProductsAdjustStockModalProps {
  open: boolean;
  onClose: () => void;
  product: { _id: string; name: string; currentStock: number } | null;
  onSuccess?: (newCurrentStock: number) => void;
}

export default function ProductsAdjustStockModal({ open, onClose, product, onSuccess }: ProductsAdjustStockModalProps) {
  const [desiredStockRaw, setDesiredStockRaw] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentStock = useMemo(() => Number(product?.currentStock ?? 0), [product]);

  useEffect(() => {
    if (open && product) {
      setDesiredStockRaw(String(currentStock));
      setError("");
      setLoading(false);
    }
  }, [open, product, currentStock]);

  const handleClose = () => {
    setError("");
    setLoading(false);
    onClose();
  };

  const onConfirm = async () => {
    if (!product) return;
    setError("");

    const desiredStock = Number(desiredStockRaw);
    if (!Number.isFinite(desiredStock)) {
      setError("Ingresa un stock válido.");
      return;
    }
    if (desiredStock < 0) {
      setError("El stock no puede ser negativo.");
      return;
    }

    setLoading(true);
    try {
      const res = await adjustProductStock(product._id, { desiredStock });
      if (!res.success || !res.data) {
        setError(res.message || "No se pudo ajustar el stock.");
        return;
      }
      const newCurrentStock = Number.isFinite(res.data.newCurrentStock) ? res.data.newCurrentStock : desiredStock;
      if (onSuccess) onSuccess(newCurrentStock);
      handleClose();
    } catch (e: any) {
      console.error("Error adjusting stock:", e);
      const msg = e?.userMessage || e?.parsedError?.message || e?.response?.data?.message || "No se pudo ajustar el stock.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={(e, reason) => { if (reason !== "backdropClick") handleClose(); }}
      className="flex items-center justify-center"
    >
      <Box sx={{
        backgroundColor: "white",
        padding: "2rem",
        borderRadius: "0.5rem",
        boxShadow: 24,
        width: 420,
        maxHeight: "80vh",
        overflowY: "auto",
      }}>
        <h2 className="text-2xl font-bold mb-2 text-center">Modificar Stock</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">{product?.name || ""}</p>

        <div className="mb-3">
          <div className="text-sm font-medium">Stock actual</div>
          <div className="text-lg font-bold">{currentStock}</div>
        </div>

        <label className="block mb-2 text-sm font-medium">Nuevo stock deseado</label>
        <Input
          type="number"
          placeholder="Nuevo stock"
          step="any"
          min={0}
          value={desiredStockRaw}
          onChange={(e) => setDesiredStockRaw(e.target.value)}
        />

        {error && <Alert type="error" message={error} styles="mb-4" />}

        <div className="flex justify-between mt-4">
          <Button variant="contained" color="error" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" onClick={onConfirm} disabled={loading || !product}>
            Confirmar
          </Button>
        </div>
      </Box>
    </Modal>
  );
}

