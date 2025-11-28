import { useEffect, useState } from "react";
import { useSalesStore } from "@/store/salesStore";
import { useSaleItemsStore } from "@/store/saleItemsStore";
import { useAuthStore } from "@/store/authStore";
import { Box, Button, Modal } from "@mui/material";
import { SalesErrorMessages } from "@/constants/salesErrors";
import Alert from "@/components/Alert";
import type { CreateSalePayload } from "@/services/api/sales";
import type { CreateSaleItemState } from "@/services/api/saleItems";
import type { CreateSaleItemPayload } from "@/services/api/saleItems";
import { v4 as uuidv4 } from 'uuid';
import Select, { type SelectOption } from "@/components/Select";
import { useProductsStore } from "@/store/productsStore";
import type { Product } from "@/services/api/products";
import { useUnitsOfMeasureStore } from "@/store/unitsOfMeasureStore";
import type { UnitOfMeasure } from "@/services/api/unitsOfMeasure";


interface SalesCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SalesCreateModal({ open, onClose }: SalesCreateModalProps) {
  const addSale = useSalesStore((s) => s.add);
  const lastAddedSale = useSalesStore((s) => s.lastAdded);
  const addManySaleItems = useSaleItemsStore((s) => s.addMany);
  const { items: productItems, fetch: fetchProducts } = useProductsStore();
  const { items: unitsOfMeasureItems, fetch: fetchUnitsOfMeasure } = useUnitsOfMeasureStore();


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

  const defaultSaleFormData: CreateSalePayload = {
    tenantId: tenantId,
    warehouseId: "main",
    userId: useAuthStore.getState().authUser?.user?.id || "ghost",
    customerName: "",
    customerDocument: "",
    status: "completed",
    paymentMethod: "",
    totalAmount: 0,
    notes: "",
  };


  const toSelectOption = (obj: UnitOfMeasure | Product) => {
    return {
      value: obj._id,
      label: obj.name
    }
  }


  useEffect(() => {
    fetchProducts()
      .then(() => {
        setProducts(productItems.map((pi) => toSelectOption(pi)));
      });

    fetchUnitsOfMeasure()
      .then(() => {
        setUnitsOfMeasure(unitsOfMeasureItems.map((uomi => toSelectOption(uomi))));
      })
  }, []);


  // factory that creates a fresh item object (new id every time)
  const createDefaultSaleItem = (): CreateSaleItemState => ({
    id: uuidv4(),
    tenantId: tenantId,
    saleId: "",
    productId: "",
    unitId: "",
    quantity: 0,
    unitPrice: 0,
    subtotal: 0,
  });

  const [saleForm, setSaleForm] = useState<CreateSalePayload>(defaultSaleFormData);
  const [items, setItems] = useState<CreateSaleItemState[]>([]);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<SelectOption[]>([]);


  const handleRemoveItem = (idx: number) => {
    if (idx < 0 || idx >= items.length) {
      console.error("Error: Index out of range when deleting a Sale item form");
      return;
    }
    // create new array without the item (immutable)
    setItems(prev => {
      const next = prev.slice(0, idx).concat(prev.slice(idx + 1));
      // update total
      const total = next.reduce((sum, it) => sum + (it.subtotal || 0), 0);
      setSaleForm(s => ({ ...s, totalAmount: total }));
      return next;
    });
  };

  const addEmptyItem = () => {
    setItems(prev => [...prev, createDefaultSaleItem()]);
  };

  const handleUpdateItem = (index: number, key: keyof CreateSaleItemState, value: any) => {
    setItems(prev => {
      const updated = prev.slice(); // shallow clone array
      const target = { ...updated[index] }; // clone target object
      target[key] = value;

      // if (key === "productId") {
      //   const productId = items.find((p) => p.productId == value)?.productId;
      //   const product = productItems.find((pi) => pi._id == productId);
      //   target.unitPrice = product.
      // }

      // recalc subtotal if needed
      if (key === "quantity" || key === "unitPrice") {
        const qty = Number(target.quantity) || 0;
        const price = Number(target.unitPrice) || 0;
        target.subtotal = qty * price;
      }

      updated[index] = target;

      // recalc sale total
      const total = updated.reduce((sum, it) => sum + (it.subtotal || 0), 0);
      setSaleForm(s => ({ ...s, totalAmount: total }));

      return updated;
    });
  };

  function toCreateSaleItemPayload(item: CreateSaleItemState): CreateSaleItemPayload {
    const { id, ...rest } = item;
    return rest;
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    if (!saleForm.notes || !saleForm.paymentMethod || !saleForm.status) {
      setError("Debe completar todos los campos del formulario de venta");
      setLoading(false);
      return;
    }

    if (items.length === 0) {
      setError("Debe agregar al menos un item");
      setLoading(false);
      return;
    }

    try {
      await addSale({ ...saleForm });
      const saleId = lastAddedSale?._id;

      const itemsToInsert: CreateSaleItemPayload[] = items.map(it => ({
        ...toCreateSaleItemPayload(it),
        saleId: saleId ?? "orphan",
      }));

      await addManySaleItems(itemsToInsert);

      setItems([]);
      setSaleForm(defaultSaleFormData);
      onClose();
    } catch (error: any) {
      console.log(JSON.stringify(error, null, 2));
      console.error("Create sale error:", error);
      const code = error?.response?.data?.code;
      const msg = SalesErrorMessages[code] || "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Crear Venta</h2>

        <form className="flex flex-col" onSubmit={onSubmit}>
          <input
            type="text"
            placeholder="Estado"
            className="border rounded p-2 w-full mb-3"
            value={saleForm.status}
            onChange={(e) => setSaleForm({ ...saleForm, status: e.target.value })}
          />

          <input
            type="text"
            placeholder="Método de pago"
            className="border rounded p-2 w-full mb-3"
            value={saleForm.paymentMethod}
            onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}
          />

          <input
            type="text"
            placeholder="Notas"
            className="border rounded p-2 w-full mb-3"
            value={saleForm.notes}
            onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
          />



          {/* id: uuidv4(),
          tenantId: tenantId,
          saleId: "",
          productId: "",
          unitId: "",
          quantity: 0,
          unitPrice: 0,
          subtotal: 0, */}

          {items.map((item, idx) => (
            <Box key={item.id} className="border p-3 rounded mb-2 bg-gray-50">
              <Select
                options={products}
                setFormInput={(value) => handleUpdateItem(idx, "productId", value)}
                styles="border rounded p-2 w-full mb-3"
              />

              <Select
                options={unitsOfMeasure}
                setFormInput={(value) => handleUpdateItem(idx, "unitId", value)}
                styles="border rounded p-2 w-full mb-3"
              />

              <input
                type="number"
                placeholder="Cantidad"
                className="border rounded p-1 w-full mb-2"
                value={item.quantity}
                onChange={(e) => handleUpdateItem(idx, "quantity", Number(e.target.value))}
              />

              <input
                type="number"
                placeholder="Precio Unitario"
                className="border p-2 w-full mb-2 bg-gray-100"
                value={item.unitPrice}
                onChange={(e) => handleUpdateItem(idx, "unitPrice", Number(e.target.value))}
              />

              <input
                type="number"
                className="border p-2 w-full mb-2 bg-gray-100"
                value={item.subtotal}
                readOnly
              />

              <Button
                color="error"
                variant="outlined"
                onClick={() => handleRemoveItem(idx)}
              >
                Eliminar
              </Button>
            </Box>
          ))}

          <div className="flex justify-end mb-2">
            <Button variant="outlined" onClick={addEmptyItem}>
              Agregar Item
            </Button>
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
                setSaleForm(defaultSaleFormData);
                setItems([]);
                onClose();
              }}
            >
              Cancelar
            </Button>

            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading || items.length === 0}
            >
              Crear Venta
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
}
