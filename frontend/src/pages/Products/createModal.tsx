import { useState } from "react";
import { useProductsStore } from "@/store/productsStore";
import { Box, Button, Modal } from "@mui/material"
import { ProductsErrorMessages } from "@/constants/productsErrors";
import Alert from "@/components/Alert";

interface ProductsCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProductsCreateModal({ open, onClose }: ProductsCreateModalProps) {
  const addProduct = useProductsStore(s => s.add);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    stock: 0,
    price: 0
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true);
    setError("")

    if (!form.name || !form.category || form.stock <= 0 || form.price <= 0) {
      setError("Debe completar todos los campos");
      setLoading(false);
      return;
    }

    try {
      await addProduct(form)
      onClose();
    } catch (error: any) {
      console.error("Create product error:", error);
      const code = error?.response?.data?.code;
      const msg = ProductsErrorMessages[code] || "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center" >
      <Box sx={{
        // bg-white p-8 rounded-2xl shadow-md
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: 24,
        width: 400,
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Crear Producto</h2>
        <form className="flex flex-col" onSubmit={onSubmit}>
          <input type="text" placeholder="Nombre" className="border rounded p-2 w-full mb-3" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input type="text" placeholder="Categoria" className="border rounded p-2 w-full mb-3" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
          <input type="number" placeholder="Stock" className="border rounded p-2 w-full mb-3" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
          <input type="number" placeholder="Precio" className="border rounded p-2 w-full mb-3" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />

          {error && <Alert type="error" boldMessage="Error: " message={error} styles="mb-4" />}

          <div className="flex justify-between mt-4">
            <Button variant="contained" color="error" onClick={onClose}>Cancelar</Button>
            <Button variant="contained" color="primary" type="submit" disabled={loading}>Agregar</Button>
          </div>
        </form>
      </Box>
    </Modal>
  )
}