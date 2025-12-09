import { useState } from "react";
import { Box, Button, Modal } from "@mui/material"
import Alert from "@/components/Alert";
import { createTenant, type CreateTenantPayload } from "@/services/api/admin";

interface AdminTenantsCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminTenantsCreateModal({ open, onClose }: AdminTenantsCreateModalProps) {
  const [error, setError] = useState("");
  const initialForm: CreateTenantPayload = {
    name: "",
    legal_name: "",
    document_type: "",
    document_number: "",
    address: "",
    phone: "",
    email: "",
  };
  const [form, setForm] = useState<CreateTenantPayload>(initialForm);
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

    if (!form.name) {
      setError("El nombre es requerido");
      setLoading(false);
      return;
    }

    try {
      const payload: CreateTenantPayload = {
        name: form.name,
        ...(form.legal_name && { legal_name: form.legal_name }),
        ...(form.document_type && { document_type: form.document_type }),
        ...(form.document_number && { document_number: form.document_number }),
        ...(form.address && { address: form.address }),
        ...(form.phone && { phone: form.phone }),
        ...(form.email && { email: form.email }),
      };
      const res = await createTenant(payload);
      if (res.success) {
        resetForm();
        onClose();
      } else {
        setError(res.message || "Error al crear tenant");
      }
    } catch (error: any) {
      console.error("Create tenant error:", error);
      setError(error?.response?.data?.message || "Error al crear tenant");
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
        width: 500,
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Crear Tenant</h2>
        <form className="flex flex-col" onSubmit={onSubmit}>
          <label className="block mb-2 text-sm font-medium">Nombre *</label>
          <input type="text" placeholder="Nombre" className="border rounded p-2 w-full mb-3" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          
          <label className="block mb-2 text-sm font-medium">Razón Social</label>
          <input type="text" placeholder="Razón Social" className="border rounded p-2 w-full mb-3" value={form.legal_name} onChange={e => setForm({ ...form, legal_name: e.target.value })} />
          
          <label className="block mb-2 text-sm font-medium">Tipo de Documento</label>
          <input type="text" placeholder="Tipo de Documento" className="border rounded p-2 w-full mb-3" value={form.document_type} onChange={e => setForm({ ...form, document_type: e.target.value })} />
          
          <label className="block mb-2 text-sm font-medium">Número de Documento</label>
          <input type="text" placeholder="Número de Documento" className="border rounded p-2 w-full mb-3" value={form.document_number} onChange={e => setForm({ ...form, document_number: e.target.value })} />
          
          <label className="block mb-2 text-sm font-medium">Dirección</label>
          <input type="text" placeholder="Dirección" className="border rounded p-2 w-full mb-3" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          
          <label className="block mb-2 text-sm font-medium">Teléfono</label>
          <input type="text" placeholder="Teléfono" className="border rounded p-2 w-full mb-3" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          
          <label className="block mb-2 text-sm font-medium">Email</label>
          <input type="email" placeholder="Email" className="border rounded p-2 w-full mb-3" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

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

