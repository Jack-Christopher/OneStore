import { useState } from "react";
import { useCategoriesStore } from "@/store/categoriesStore";
import { useAuthStore } from "@/store/authStore";
import { Box, Button, Modal } from "@mui/material"
import { CategoriesErrorMessages } from "@/constants/categoriesErrors";
import Alert from "@/components/Alert";
import { trimStringValues, createTrimmedBlurHandler } from "@/utils/formUtils";

interface CategoriesCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CategoriesCreateModal({ open, onClose, onSuccess }: CategoriesCreateModalProps) {
  const addCategory = useCategoriesStore(s => s.add);
  const [error, setError] = useState("");
  const initialForm = {
    tenantId: useAuthStore.getState().authUser?.user?.tenantId || "orphan",
    name: "",
    description: "",
  };
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setForm(initialForm);
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

    if (!form.name || !form.description) {
      setError("Debe completar todos los campos");
      setLoading(false);
      return;
    }

    try {
      // Trim all string values before submitting
      const trimmedForm = trimStringValues(form);
      await addCategory(trimmedForm)
      resetForm();
      onClose();
      // Trigger refresh after successful creation
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Create category error:", error);
      // Use the parsed error from axios interceptor or parse it ourselves
      const errorMessage = error?.userMessage || error?.parsedError?.message || error?.response?.data?.message;
      const errorCode = error?.errorCode || error?.parsedError?.code || error?.response?.data?.code;
      
      // Try to get message from error constants first, then use parsed message
      const msg = errorCode && CategoriesErrorMessages[errorCode] 
        ? CategoriesErrorMessages[errorCode] 
        : errorMessage || "Ocurrió un error inesperado";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

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
        <h2 className="text-2xl font-bold mb-4 text-center">Crear Categoría</h2>
        <form className="flex flex-col" onSubmit={onSubmit}>
          <label className="block mb-2 text-sm font-medium">Nombre</label>
          <input 
            type="text" 
            placeholder="Nombre" 
            className="border rounded p-2 w-full mb-3" 
            value={form.name} 
            onChange={e => setForm({ ...form, name: e.target.value })}
            onBlur={createTrimmedBlurHandler(setForm, 'name')}
          />
          <label className="block mb-2 text-sm font-medium">Descripción</label>
          <textarea 
            placeholder="Descripción" 
            className="border rounded p-2 w-full mb-3" 
            value={form.description} 
            onChange={e => setForm({ ...form, description: e.target.value })}
            onBlur={createTrimmedBlurHandler(setForm, 'description')}
          />

          {error && <Alert type="error" message={error} styles="mb-4" />}

          <div className="flex justify-between mt-4">
            <Button variant="contained" color="error" onClick={handleClose}>Cancelar</Button>
            <Button variant="contained" color="primary" type="submit" disabled={loading}>Agregar</Button>
          </div>
        </form>
      </Box>
    </Modal>
  )
}