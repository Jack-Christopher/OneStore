import { useEffect, useState } from "react";
import { useSuppliersStore } from "@/store/suppliersStore";
import { Box, Button, Modal } from "@mui/material";
import Alert from "@/components/Alert";
import { getSupplier } from "@/services/api/suppliers";
import type { UpdateSupplierPayload } from "@/services/api/suppliers";

interface SuppliersEditModalProps {
  open: boolean;
  onClose: () => void;
  supplierId: string | null;
}

export default function SuppliersEditModal({ open, onClose, supplierId }: SuppliersEditModalProps) {
  const editSupplier = useSuppliersStore((s) => s.edit);

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

  const [formData, setFormData] = useState<UpdateSupplierPayload>({
    name: "",
    contactName: "",
    phone: "",
    email: "",
    address: "",
    ruc: "",
  });

  useEffect(() => {
    if (supplierId && open) {
      setLoading(true);
      getSupplier(supplierId)
        .then((res) => {
          if (res.success && res.data) {
            const s = res.data as any;
            setFormData({
              name: s.name || "",
              contactName: s.contact_name || "",
              phone: s.phone || "",
              email: s.email || "",
              address: s.address || "",
              ruc: s.ruc || "",
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [supplierId, open]);

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
      await editSupplier(supplierId as string, formData);
      onClose();
    } catch (error: any) {
      console.error("Edit supplier error:", error);
      setError("Error al editar el proveedor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Editar Proveedor</h2>

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

          <label className="block mb-2 text-sm font-medium">RUC</label>
          <input
            type="text"
            placeholder="RUC"
            className="border rounded p-2 w-full mb-3"
            value={formData.ruc || ""}
            onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
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
            <Button variant="contained" color="error" onClick={onClose}>
              Cancelar
            </Button>

            <Button
              variant="contained"
              color="success"
              type="submit"
              disabled={loading}
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}

