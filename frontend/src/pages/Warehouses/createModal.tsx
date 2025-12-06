import { useState } from "react";
import { useWarehousesStore } from "@/store/warehousesStore";
import { useAuthStore } from "@/store/authStore";
import { Box, Button, Modal, Checkbox, FormControlLabel } from "@mui/material";
import Alert from "@/components/Alert";
import type { CreateWarehousePayload } from "@/services/api/warehouses";

interface WarehousesCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function WarehousesCreateModal({ open, onClose }: WarehousesCreateModalProps) {
  const addWarehouse = useWarehousesStore((s) => s.add);
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

  const defaultFormData: CreateWarehousePayload = {
    tenantId: tenantId,
    name: "",
    address: "",
    phone: "",
    isActive: true,
  };

  const [formData, setFormData] = useState<CreateWarehousePayload>(defaultFormData);

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
      await addWarehouse(formData);
      setFormData(defaultFormData);
      onClose();
    } catch (error: any) {
      console.error("Create warehouse error:", error);
      setError("Error al crear la bodega");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Crear Bodega</h2>

        <form className="flex flex-col" onSubmit={onSubmit}>
          <label className="block mb-2 text-sm font-medium">Nombre *</label>
          <input
            type="text"
            placeholder="Nombre"
            className="border rounded p-2 w-full mb-3"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <label className="block mb-2 text-sm font-medium">Dirección</label>
          <input
            type="text"
            placeholder="Dirección"
            className="border rounded p-2 w-full mb-3"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <label className="block mb-2 text-sm font-medium">Teléfono</label>
          <input
            type="text"
            placeholder="Teléfono"
            className="border rounded p-2 w-full mb-3"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            }
            label="Activa"
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
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                setFormData(defaultFormData);
                onClose();
              }}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              color="success"
              type="submit"
              disabled={loading}
            >
              Crear Bodega
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}

