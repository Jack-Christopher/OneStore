import { useEffect, useState } from "react";
import { useUnitsOfMeasureStore } from "@/store/unitsOfMeasureStore";
import { useAuthStore } from "@/store/authStore";
import { Box, Button, Input, Modal } from "@mui/material"
import { UnitsOfMeasureErrorMessages } from "@/constants/unitsOfMeasureErrors";
import Alert from "@/components/Alert";
import { getUnitOfMeasure, type UnitOfMeasure, type UpdateUnitOfMeasurePayload } from "@/services/api/unitsOfMeasure";
import type { ApiResponse } from "@/types/api";

interface UnitsOfMeasureEditModalProps {
  open: boolean;
  onClose: () => void;
  unitOfMeasureId: string | null;
  onSuccess?: () => void;
}

export default function UnitsOfMeasureEditModal({ open, onClose, unitOfMeasureId, onSuccess }: UnitsOfMeasureEditModalProps) {
  const editUnitOfMeasure = useUnitsOfMeasureStore(s => s.edit);
  const [error, setError] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState<UnitOfMeasure | null>(null);
  const [form, setForm] = useState<UpdateUnitOfMeasurePayload>({
    tenantId: useAuthStore.getState().authUser?.user?.tenantId || "orphan",
    name: unitOfMeasure?.name || "",
    code: unitOfMeasure?.code || "",
    description: unitOfMeasure?.description || "",
  });
  const [loading, setLoading] = useState(false);
  
  const [initialForm, setInitialForm] = useState<UpdateUnitOfMeasurePayload | null>(null);

  useEffect(() => {
    if (unitOfMeasureId && unitOfMeasureId !== null) {
      console.log("fetching unit of measure", unitOfMeasureId)
      getUnitOfMeasure(unitOfMeasureId)
        .then((res: ApiResponse<UnitOfMeasure>) => {
          if (res.success) {
            setUnitOfMeasure(res.data)
            const initialData = {
              tenantId: useAuthStore.getState().authUser?.user?.tenantId || "orphan",
              name: res.data?.name || "",
              code: res.data?.code || "",
              description: res.data?.description || "",
            };
            setForm(initialData);
            setInitialForm(initialData);
          }
        })
    }
  }, [unitOfMeasureId])

  const resetForm = () => {
    if (initialForm) {
      setForm(initialForm);
    }
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };
  
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
      await editUnitOfMeasure(unitOfMeasureId as string, form)
      resetForm();
      onClose();
      // Trigger refresh after successful update
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Edit unit of measure error:", error);
      const code = error?.response?.data?.code;
      const msg = UnitsOfMeasureErrorMessages[code] || "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }
  
  if (!open) return null;
  
    return (
    <Modal 
      open={open} 
      onClose={(e, reason) => { if (reason !== 'backdropClick') handleClose(); }} 
      className="flex items-center justify-center" 
    >
      <Box sx={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: 24,
        width: 400,
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Editar Unidad de Medida</h2>
        <form className="flex flex-col" onSubmit={onSubmit}>
          <label className="block mb-2 text-sm font-medium">Nombre</label>
          <Input type="text" placeholder="Nombre" className="border rounded p-2 w-full mb-3" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <label className="block mb-2 text-sm font-medium">Código</label>
          <Input type="text" placeholder="Código" className="border rounded p-2 w-full mb-3" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
          <label className="block mb-2 text-sm font-medium">Descripción</label>
          <textarea placeholder="Descripción" className="border rounded p-2 w-full mb-3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          {error && <Alert type="error" boldMessage="Error: " message={error} styles="mb-4" />}

          <div className="flex justify-between mt-4">
            <Button variant="contained" color="error" onClick={handleClose}>Cancelar</Button>
            <Button variant="contained" color="primary" type="submit" disabled={loading}>Editar</Button>
          </div>
        </form>
      </Box>
    </Modal>
  )
}