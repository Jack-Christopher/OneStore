import { useState } from "react";
import { Box, Button, Modal } from "@mui/material"
import Alert from "@/components/Alert";
import { createManager, type CreateManagerPayload, type Tenant } from "@/services/api/admin";

interface AdminManagersCreateModalProps {
  open: boolean;
  onClose: () => void;
  tenants: Tenant[];
  onSuccess: () => void;
}

export default function AdminManagersCreateModal({ open, onClose, tenants, onSuccess }: AdminManagersCreateModalProps) {
  const [error, setError] = useState("");
  const initialForm: CreateManagerPayload = {
    email: "",
    password: "",
    full_name: "",
    tenant_id: "",
  };
  const [form, setForm] = useState<CreateManagerPayload>(initialForm);
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

    if (!form.email || !form.password || !form.tenant_id) {
      setError("Debe completar todos los campos requeridos");
      setLoading(false);
      return;
    }

    try {
      const res = await createManager(form);
      if (res.success) {
        resetForm();
        onSuccess();
      } else {
        setError(res.message || "Error al crear manager");
      }
    } catch (error: any) {
      console.error("Create manager error:", error);
      setError(error?.response?.data?.message || "Error al crear manager");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={(_e, reason) => { if (reason !== 'backdropClick') handleClose(); }}
      className="flex items-center justify-center"
    >
      <Box sx={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: 24,
        width: 500,
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Crear Manager</h2>
        <form className="flex flex-col" onSubmit={onSubmit}>
          <label className="block mb-2 text-sm font-medium">Tenant *</label>
          <select
            className="border rounded p-2 w-full mb-3"
            value={form.tenant_id}
            onChange={e => setForm({ ...form, tenant_id: e.target.value })}
            required
          >
            <option value="">Seleccionar tenant</option>
            {tenants.map((tenant) => (
              <option key={tenant._id} value={tenant._id}>
                {tenant.name}
              </option>
            ))}
          </select>

          <label className="block mb-2 text-sm font-medium">Email *</label>
          <input type="email" placeholder="Email" className="border rounded p-2 w-full mb-3" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />

          <label className="block mb-2 text-sm font-medium">Contraseña *</label>
          <input type="password" placeholder="Contraseña" className="border rounded p-2 w-full mb-3" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />

          <label className="block mb-2 text-sm font-medium">Nombre Completo</label>
          <input type="text" placeholder="Nombre Completo" className="border rounded p-2 w-full mb-3" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />

          {error && <Alert type="error" boldMessage="Error: " message={error} styles="mb-4" />}

          <div className="flex justify-between mt-4">
            <Button variant="contained" color="error" onClick={handleClose}>Cancelar</Button>
            <Button variant="contained" color="primary" type="submit" disabled={loading}>Agregar</Button>
          </div>
        </form>
      </Box>
    </Modal>
  )
}

