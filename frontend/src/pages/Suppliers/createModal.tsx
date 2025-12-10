import { useState } from "react";
import { useSuppliersStore } from "@/store/suppliersStore";
import { useAuthStore } from "@/store/authStore";
import { Box, Button, Modal } from "@mui/material";
import Alert from "@/components/Alert";
import type { CreateSupplierPayload } from "@/services/api/suppliers";
import { trimStringValues, createTrimmedBlurHandler } from "@/utils/formUtils";

interface SuppliersCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SuppliersCreateModal({ open, onClose }: SuppliersCreateModalProps) {
  const addSupplier = useSuppliersStore((s) => s.add);
  const tenantId = useAuthStore.getState().authUser?.user?.tenantId || "orphan";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  const defaultFormData: CreateSupplierPayload = {
    tenantId: tenantId,
    name: "",
    contactName: "",
    document: "",
    phone: "",
    email: "",
    address: "",
  };

  const [formData, setFormData] = useState<CreateSupplierPayload>(defaultFormData);

  const resetForm = () => {
    setFormData(defaultFormData);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name) {
      setError("El nombre es requerido");
      setLoading(false);
      return;
    }

    try {
      // Trim all string values before submitting
      const trimmedFormData = trimStringValues(formData);
      await addSupplier(trimmedFormData);
      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Create supplier error:", error);
      setError("Error al crear el proveedor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      open={open} 
      onClose={(e, reason) => { if (reason !== 'backdropClick') handleClose(); }} 
      className="flex items-center justify-center"
    >
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Crear Proveedor</h2>

        <form className="flex flex-col" onSubmit={onSubmit}>
          <label className="block mb-2 text-sm font-medium">Nombre *</label>
          <input
            type="text"
            placeholder="Nombre"
            className="border rounded p-2 w-full mb-3"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <label className="block mb-2 text-sm font-medium">Nombre de Contacto</label>
          <input
            type="text"
            placeholder="Nombre de Contacto"
            className="border rounded p-2 w-full mb-3"
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          />

          <label className="block mb-2 text-sm font-medium">Teléfono</label>
          <input
            type="text"
            placeholder="Teléfono"
            className="border rounded p-2 w-full mb-3"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <label className="block mb-2 text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="Email"
            className="border rounded p-2 w-full mb-3"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <label className="block mb-2 text-sm font-medium">Dirección</label>
          <input
            type="text"
            placeholder="Dirección"
            className="border rounded p-2 w-full mb-3"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <label className="block mb-2 text-sm font-medium">Documento (RUC/DNI)</label>
          <input
            type="text"
            placeholder="RUC o DNI"
            className="border rounded p-2 w-full mb-3"
            value={formData.document}
            onChange={(e) => setFormData({ ...formData, document: e.target.value })}
          />

          {error && (
            <Alert
              type="error"
              boldMessage="Error: "
              message={error}
              styles="mb-4"
            />
          )}

          <div className="flex justify-between mt-4">
            <Button
              variant="contained"
              color="error"
              onClick={handleClose}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              color="success"
              type="submit"
              disabled={loading}
            >
              Crear Proveedor
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}

