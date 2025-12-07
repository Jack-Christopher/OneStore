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
import type { CreateProductFormulaItem, ProductFormula } from "@/services/api/productFormulas";
import { useProductFormulasStore } from "@/store/productFormulasStore";
import Input from "@/components/Input";


interface SalesCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SalesCreateModal({ open, onClose }: SalesCreateModalProps) {
  const addSale = useSalesStore((s) => s.add);
  const addManySaleItems = useSaleItemsStore((s) => s.addMany);
  const { items: productItems, fetch: fetchProducts } = useProductsStore();
  const { items: unitsOfMeasureItems, fetch: fetchUnitsOfMeasure } = useUnitsOfMeasureStore();
  const { items: productFormulasItems, fetch: fetchProductFormulas } = useProductFormulasStore();

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


  const toSelectOption = (obj: UnitOfMeasure | Product | ProductFormula) => {
    return {
      value: obj._id,
      label: obj.name,
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

    fetchProductFormulas()
      .then(() => {
        setProductFormulas(productFormulasItems.map((f) => toSelectOption(f)));
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
  const [productFormulas, setProductFormulas] = useState<SelectOption[]>([]);

  const [openFormulaModal, setOpenFormulaModal] = useState(false);
  const [selectedFormula, setSelectedFormula] = useState<SelectOption | null>(null);


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

  const FormulaModal = () => {

    return (
      <Modal open={openFormulaModal} onClose={() => { setOpenFormulaModal(false) }} className="flex items-center justify-center">
        <Box sx={boxStyle}>
          <h2 className="text-2xl font-bold mb-4 text-center">Aplicar Fórmula</h2>
          <Select
            options={productFormulas}
            setFormInput={(value) => setSelectedFormula(productFormulas.find((f) => f.value === value) || null)}
            styles="border rounded p-2 w-full mb-3"
            value={selectedFormula?.value || ""}
          />
          <div className="flex justify-center mb-2 gap-2">
            <Button variant="outlined" color="error" onClick={() => setOpenFormulaModal(false)}>Cancelar</Button>
            <Button variant="outlined" color="primary" onClick={() => applyFormula()}>Aplicar</Button>
          </div>
        </Box>
      </Modal>
    );
  };


  const applyFormula = () => {
    // the items should be updated with the formula items (product_id, unit_id, quantity) and the total amount should be updated
    const formulaId = selectedFormula?.value;
    const formula = productFormulasItems.find(f => f._id === formulaId);
    if (!formula) {
      return;
    }
    formula.items.forEach((item) => {
      handleAddItemWithFormula({
        id: uuidv4(),
        // @ts-ignore TODO: fix this
        productId: item.product_id,
        // @ts-ignore TODO: fix this
        unitId: item.unit_id,
        quantity: item.quantity,
      });
    });
    setOpenFormulaModal(false);
    setSelectedFormula(null);
  };

  const handleUpdateItem = (index: number, key: keyof CreateSaleItemState, value: any) => {
    setItems(prev => {
      const updated = prev.slice(); // shallow clone array
      const target = { ...updated[index] }; // clone target object
      // @ts-ignore TODO: fix this
      target[key] = value;

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


  const handleAddItemWithFormula = (formulaItem: CreateProductFormulaItem) => {
    setItems(prev => [...prev, { ...createDefaultSaleItem(), productId: formulaItem.productId, unitId: formulaItem.unitId, quantity: formulaItem.quantity }]);
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

    // Validate that all items have required fields filled
    console.log("items", items);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId || item.productId === "") {
        setError(`Producto requerido para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }
      if (!item.unitId || item.unitId === "") {
        setError(`Unidad de medida requerida para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        setError(`Cantidad debe ser mayor a 0 para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }

      // Validate stock availability
      const product = productItems.find(p => p._id === item.productId);
      if (product) {
        const availableStock = product.currentStock || 0;
        if (item.quantity > availableStock) {
          setError(`Stock insuficiente para el producto "${product.name}" en el ítem ${i + 1}. Stock disponible: ${availableStock}, solicitado: ${item.quantity}`);
          setLoading(false);
          return;
        }
      }

      if (!item.unitPrice || item.unitPrice <= 0) {
        setError(`Precio unitario debe ser mayor a 0 para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }
      if (!item.subtotal || item.subtotal <= 0) {
        setError(`Subtotal debe ser mayor a 0 para el ítem ${i + 1}`);
        setLoading(false);
        return;
      }
    }
    try {
      const createdSale = await addSale({ ...saleForm });
      const saleId = createdSale?._id;
      console.log("createdSale", createdSale);
      console.log("saleId", saleId);

      const itemsToInsert: CreateSaleItemPayload[] = items.map(it => ({
        ...toCreateSaleItemPayload(it),
        saleId: saleId || "orphan",
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
          <label className="block mb-2 text-sm font-medium">Método de pago</label>
          <input
            type="text"
            placeholder="Método de pago"
            className="border rounded p-2 w-full mb-3"
            value={saleForm.paymentMethod}
            onChange={(e) => setSaleForm({ ...saleForm, paymentMethod: e.target.value })}
          />

          <label className="block mb-2 text-sm font-medium">Notas</label>
          <input
            type="text"
            placeholder="Notas"
            className="border rounded p-2 w-full mb-3"
            value={saleForm.notes}
            onChange={(e) => setSaleForm({ ...saleForm, notes: e.target.value })}
          />

          {items.map((item, idx) => (
            <Box key={item.id} className="border p-3 rounded mb-2 bg-gray-50">
              <label className="block mb-2 text-sm font-medium bg-blue-100 p-2 rounded text-center">Item {idx + 1}</label>
              <label className="block mb-2 text-sm font-medium">Producto</label>
              <Select
                options={products}
                setFormInput={(value) => handleUpdateItem(idx, "productId", value)}
                styles="border rounded p-2 w-full mb-3"
                value={item.productId}
              />
              <label className="block mb-2 text-sm font-medium">Unidad de Medida</label>
              <Select
                options={unitsOfMeasure}
                setFormInput={(value) => handleUpdateItem(idx, "unitId", value)}
                styles="border rounded p-2 w-full mb-3"
                value={item.unitId}
              />
              <label className="block mb-2 text-sm font-medium">Cantidad</label>
              {(() => {
                const selectedProduct = productItems.find(p => p._id === item.productId);
                const availableStock = selectedProduct?.currentStock || 0;
                const quantity = item.quantity || 0;
                const exceedsStock = quantity > availableStock;

                return (
                  <>
                    <Input
                      type="number"
                      placeholder="Cantidad"
                      value={item.quantity || 0}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateItem(idx, "quantity", Number(e.target.value))}
                      style={exceedsStock ? { borderColor: 'red', borderWidth: '2px' } : {}}
                    />
                    {item.productId && (
                      <div className="text-sm mt-1">
                        <span className={availableStock > 0 ? 'text-green-600' : 'text-red-600'}>
                          Stock disponible: {availableStock}
                        </span>
                        {exceedsStock && (
                          <span className="text-red-600 block">⚠️ La cantidad excede el stock disponible</span>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
              <label className="block mb-2 text-sm font-medium">Precio Unitario</label>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateItem(idx, "subtotal", Number(e.target.value))}
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

          <div className="flex justify-center mb-2 gap-2">
            <Button variant="outlined" color="primary" onClick={addEmptyItem}>
              Agregar Item
            </Button>
            <Button variant="outlined" color="primary" onClick={() => setOpenFormulaModal(true)}>
              Aplicar Fórmula
            </Button>
          </div>

          <FormulaModal />

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
              color="success"
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
