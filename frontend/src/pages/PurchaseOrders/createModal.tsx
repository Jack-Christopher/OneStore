import { useEffect, useState } from "react";
import { usePurchaseOrdersStore } from "@/store/purchaseOrdersStore";
import { useSuppliersStore } from "@/store/suppliersStore";
import { useWarehousesStore } from "@/store/warehousesStore";
import { useProductsStore } from "@/store/productsStore";
import { useAuthStore } from "@/store/authStore";
import { Box, Button, Modal } from "@mui/material";
import Alert from "@/components/Alert";
import Select, { type SelectOption } from "@/components/Select";
import Input from "@/components/Input";
import { v4 as uuidv4 } from 'uuid';
import type { CreatePurchaseOrderWithItemsPayload } from "@/services/api/purchaseOrders";

interface PurchaseOrdersCreateModalProps {
  open: boolean;
  onClose: () => void;
}

interface OrderItemState {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export default function PurchaseOrdersCreateModal({ open, onClose }: PurchaseOrdersCreateModalProps) {
  const addWithItems = usePurchaseOrdersStore((s) => s.addWithItems);
  const { items: suppliers, fetch: fetchSuppliers } = useSuppliersStore();
  const { items: warehouses, fetch: fetchWarehouses } = useWarehousesStore();
  const { items: products, fetch: fetchProducts } = useProductsStore();

  const tenantId = useAuthStore.getState().authUser?.user?.tenantId || "orphan";
  const userId = useAuthStore.getState().authUser?.user?.id || "ghost";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const boxStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    maxHeight: '80vh',
    overflowY: 'auto',
  };

  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItemState[]>([]);

  const [supplierOptions, setSupplierOptions] = useState<SelectOption[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<SelectOption[]>([]);
  const [productOptions, setProductOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    fetchSuppliers().then(() => {
      setSupplierOptions(suppliers.map(s => ({ value: s._id, label: s.name })));
    });
    fetchWarehouses().then(() => {
      setWarehouseOptions(warehouses.map(w => ({ value: w._id, label: w.name })));
    });
    fetchProducts().then(() => {
      setProductOptions(products.map(p => ({ value: p._id, label: p.name })));
    });
  }, []);

  useEffect(() => {
    setSupplierOptions(suppliers.map(s => ({ value: s._id, label: s.name })));
  }, [suppliers]);

  useEffect(() => {
    setWarehouseOptions(warehouses.map(w => ({ value: w._id, label: w.name })));
  }, [warehouses]);

  useEffect(() => {
    setProductOptions(products.map(p => ({ value: p._id, label: p.name })));
  }, [products]);

  const createDefaultItem = (): OrderItemState => ({
    id: uuidv4(),
    productId: "",
    quantity: 0,
    unitPrice: 0,
    subtotal: 0,
  });

  const addEmptyItem = () => {
    setItems(prev => [...prev, createDefaultItem()]);
  };

  const handleRemoveItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateItem = (index: number, key: keyof OrderItemState, value: any) => {
    setItems(prev => {
      const updated = [...prev];
      const target = { ...updated[index] };
      (target as any)[key] = value;

      if (key === "quantity" || key === "unitPrice") {
        const qty = Number(target.quantity) || 0;
        const price = Number(target.unitPrice) || 0;
        target.subtotal = qty * price;
      }

      updated[index] = target;
      return updated;
    });
  };

  const getTotalAmount = () => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const resetForm = () => {
    setSupplierId("");
    setWarehouseId("");
    setReferenceNumber("");
    setNotes("");
    setItems([]);
    setError("");
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!supplierId) {
      setError("Debe seleccionar un proveedor");
      setLoading(false);
      return;
    }

    if (!warehouseId) {
      setError("Debe seleccionar una bodega");
      setLoading(false);
      return;
    }

    if (items.length === 0) {
      setError("Debe agregar al menos un item");
      setLoading(false);
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId) {
        setError(`Producto requerido para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        setError(`Cantidad debe ser mayor a 0 para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        setError(`Precio unitario debe ser mayor a 0 para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }
    }

    try {
      const payload: CreatePurchaseOrderWithItemsPayload = {
        order: {
          tenantId,
          supplierId,
          warehouseId,
          userId,
          status: 'pending',
          referenceNumber,
          totalAmount: getTotalAmount(),
          notes,
        },
        items: items.map(item => ({
          tenantId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
      };

      await addWithItems(payload);
      resetForm();
      onClose();
    } catch (error: any) {
      console.error("Create purchase order error:", error);
      setError("Error al crear la orden de compra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={() => { resetForm(); onClose(); }} className="flex items-center justify-center">
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Nueva Orden de Compra</h2>

        <form className="flex flex-col" onSubmit={onSubmit}>
          <label className="block mb-2 text-sm font-medium">Proveedor *</label>
          <Select
            options={supplierOptions}
            setFormInput={(value) => setSupplierId(value)}
            styles="border rounded p-2 w-full mb-3"
            value={supplierId}
          />

          <label className="block mb-2 text-sm font-medium">Bodega *</label>
          <Select
            options={warehouseOptions}
            setFormInput={(value) => setWarehouseId(value)}
            styles="border rounded p-2 w-full mb-3"
            value={warehouseId}
          />

          <label className="block mb-2 text-sm font-medium">Número de Referencia</label>
          <input
            type="text"
            placeholder="Número de Referencia"
            className="border rounded p-2 w-full mb-3"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />

          <label className="block mb-2 text-sm font-medium">Notas</label>
          <input
            type="text"
            placeholder="Notas"
            className="border rounded p-2 w-full mb-3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <hr className="my-3" />
          <h3 className="text-lg font-semibold mb-2">Items</h3>

          {items.map((item, idx) => (
            <Box key={item.id} className="border p-3 rounded mb-2 bg-gray-50">
              <label className="block mb-2 text-sm font-medium bg-blue-100 p-2 rounded text-center">Item {idx + 1}</label>

              <label className="block mb-2 text-sm font-medium">Producto *</label>
              <Select
                options={productOptions}
                setFormInput={(value) => handleUpdateItem(idx, "productId", value)}
                styles="border rounded p-2 w-full mb-3"
                value={item.productId}
              />

              <label className="block mb-2 text-sm font-medium">Cantidad *</label>
              <Input
                type="number"
                placeholder="Cantidad"
                value={item.quantity || 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateItem(idx, "quantity", Number(e.target.value))}
              />

              <label className="block mb-2 text-sm font-medium">Precio Unitario *</label>
              <Input
                type="number"
                placeholder="Precio Unitario"
                value={item.unitPrice || 0}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateItem(idx, "unitPrice", Number(e.target.value))}
              />

              <label className="block mb-2 text-sm font-medium">Subtotal</label>
              <Input
                type="number"
                placeholder="Subtotal"
                value={item.subtotal || 0}
                readOnly
                onChange={() => {}}
              />

              <Button color="error" variant="outlined" onClick={() => handleRemoveItem(idx)}>
                Eliminar
              </Button>
            </Box>
          ))}

          <Button variant="outlined" color="primary" onClick={addEmptyItem} className="mb-3">
            Agregar Item
          </Button>

          <div className="text-right font-bold mb-3">
            Total: ${getTotalAmount().toFixed(2)}
          </div>

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
                resetForm();
                onClose();
              }}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              color="success"
              type="submit"
              disabled={loading || items.length === 0}
            >
              Crear Orden
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}

