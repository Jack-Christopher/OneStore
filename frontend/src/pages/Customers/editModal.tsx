import { useEffect, useState } from "react";
import { useCustomersStore } from "@/store/customersStore";
import { Box, Button, Modal, Checkbox, FormControlLabel } from "@mui/material";
import Alert from "@/components/Alert";
import { getCustomer } from "@/services/api/customers";
import type { UpdateCustomerPayload } from "@/services/api/customers";

interface CustomersEditModalProps {
  open: boolean;
  onClose: () => void;
  customerId: string | null;
}

export default function CustomersEditModal({ open, onClose, customerId }: CustomersEditModalProps) {
  const editCustomer = useCustomersStore((s) => s.edit);

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

  const [formData, setFormData] = useState<UpdateCustomerPayload>({
    name: "",
    document: "",
    phone: "",
    email: "",
    address: "",
    ruc: "",
    isActive: true,
  });

  useEffect(() => {
    if (customerId && open) {
      setLoading(true);
      getCustomer(customerId)
        .then((res) => {
          if (res.success && res.data) {
            const c = res.data as any;
            setFormData({
              name: c.name || "",
              document: c.document || "",
              phone: c.phone || "",
              email: c.email || "",
              address: c.address || "",
              ruc: c.ruc || "",
              isActive: c.is_active ?? true,
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [customerId, open]);

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
      await editCustomer(customerId as string, formData);
      onClose();
    } catch (error: any) {
      console.error("Edit customer error:", error);
      setError("Error al editar el cliente");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Editar Cliente</h2>

        <form className="flex flex-col" onSubmit={onSubmit}>
          <label className="block mb-2 text-sm font-medium">Nombre *</label>
          <input
            type="text"
            placeholder="Nombre"
            className="border rounded p-2 w-full mb-3"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <label className="block mb-2 text-sm font-medium">Documento</label>
          <input
            type="text"
            placeholder="Documento (RUC/DNI)"
            className="border rounded p-2 w-full mb-3"
            value={formData.document}
            onChange={(e) => setFormData({ ...formData, document: e.target.value })}
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

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            }
            label="Activo"
            className="mb-3"
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

