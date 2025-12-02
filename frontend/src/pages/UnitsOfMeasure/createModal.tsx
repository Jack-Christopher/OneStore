import { useState } from "react";
import { useUnitsOfMeasureStore } from "@/store/unitsOfMeasureStore";
import { useAuthStore } from "@/store/authStore";
import { Box, Button, Modal } from "@mui/material"
import { UnitsOfMeasureErrorMessages } from "@/constants/unitsOfMeasureErrors";
import Alert from "@/components/Alert";

interface UnitsOfMeasureCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UnitsOfMeasureCreateModal({ open, onClose }: UnitsOfMeasureCreateModalProps) {
  const addUnitOfMeasure = useUnitsOfMeasureStore(s => s.add);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    tenantId: useAuthStore.getState().authUser?.user?.tenantId || "orphan",
    name: "",
    code: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true);
    setError("")

    if (!form.name || !form.code || !form.description) {
      setError("Debe completar todos los campos");
      setLoading(false);
      return;
    }

    try {
      await addUnitOfMeasure(form)
      onClose();
    } catch (error: any) {
      console.error("Create unit of measure error:", error);
      const code = error?.response?.data?.code;
      const msg = UnitsOfMeasureErrorMessages[code] || "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center" >
      <Box sx={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: 24,
        width: 400,
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Crear Unidad de Medida</h2>
        <form className="flex flex-col" onSubmit={onSubmit}>
          <label className="block mb-2 text-sm font-medium">Nombre</label>
          <input type="text" placeholder="Nombre" className="border rounded p-2 w-full mb-3" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <label className="block mb-2 text-sm font-medium">Código</label>
          <input type="text" placeholder="Código" className="border rounded p-2 w-full mb-3" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
          <label className="block mb-2 text-sm font-medium">Descripción</label>
          <textarea placeholder="Descripción" className="border rounded p-2 w-full mb-3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

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