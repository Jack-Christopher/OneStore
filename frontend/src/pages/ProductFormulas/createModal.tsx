import { useEffect, useState } from "react";
import { useProductFormulasStore } from "@/store/productFormulasStore";
import { useAuthStore } from "@/store/authStore";
import { Box, Button, Modal } from "@mui/material"
import { ProductFormulasErrorMessages } from "@/constants/productFormulasErrors";
import Alert from "@/components/Alert";
import { v4 as uuidv4 } from 'uuid';
import { useUnitsOfMeasureStore } from "@/store/unitsOfMeasureStore";
import { useProductsStore } from "@/store/productsStore";
import type { SelectOption } from "@/components/Select";
import Input from "@/components/Input";
import type { Product } from "@/services/api/products";
import type { UnitOfMeasure } from "@/services/api/unitsOfMeasure";
import Select from "@/components/Select";
import type { CreateProductFormulaItem } from "@/services/api/productFormulas";
import { trimStringValues, createTrimmedBlurHandler } from "@/utils/formUtils";

interface ProductFormulasCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ProductFormulasCreateModal({ open, onClose, onSuccess }: ProductFormulasCreateModalProps) {
  const addProductFormula = useProductFormulasStore(s => s.add);
  const { items: productItems, fetch: fetchProducts } = useProductsStore();
  const { items: unitOfMeasureItems, fetch: fetchUnitsOfMeasure } = useUnitsOfMeasureStore();
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<SelectOption[]>([]);


  const toSelectOption = (obj: Product | UnitOfMeasure): SelectOption => {
    return {
      value: obj._id,
      label: obj.name
    }
  };

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


  const [error, setError] = useState("");
  const initialForm = {
    tenantId: useAuthStore.getState().authUser?.user?.tenantId || "orphan",
    name: "",
    description: "",
    items: [],
    referenceQuantity: 0,
    referenceUnitId: "",
  };
  const [form, setForm] = useState(initialForm);
  const [items, setItems] = useState<CreateProductFormulaItem[]>([]);

  const resetForm = () => {
    setForm(initialForm);
    setItems([]);
    setError("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  }

  const addEmptyItem = () => {
    setItems(prev => [...prev, { id: uuidv4(), productId: "", unitId: "", quantity: 0 }]);
  }

  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true);
    setError("")

    if (!form.name || !form.description) {
      setError("Debe completar todos los campos");
      setLoading(false);
      return;
    }

    if (!form.referenceQuantity || form.referenceQuantity <= 0) {
      setError("La cantidad de referencia debe ser mayor a 0");
      setLoading(false);
      return;
    }

    if (!form.referenceUnitId || form.referenceUnitId === "") {
      setError("Debe seleccionar una unidad de referencia");
      setLoading(false);
      return;
    }

    if (items.length === 0) {
      setError("Debe agregar al menos un producto a la fórmula");
      setLoading(false);
      return;
    }

    // Validate that all items have required fields filled
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
    }

    try {
      // Trim all string values before submitting
      const trimmedForm = trimStringValues(form);
      // merge items into form for submission
      await addProductFormula({ ...trimmedForm, items })
      resetForm();
      onClose();
      // Trigger refresh after successful creation
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Create product formula error:", error);
      const code = error?.response?.data?.code;
      const msg = ProductFormulasErrorMessages[code] || "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts()
      .then(() => {
        console.log("productItems", productItems);
        setProducts(productItems.map((pi) => toSelectOption(pi)));
      });
    fetchUnitsOfMeasure()
      .then(() => {
        setUnitsOfMeasure(unitOfMeasureItems.map((uomi => toSelectOption(uomi))));
      });
  }, []);

  useEffect(() => {
    console.log("items", items);
  }, [items]);

  return (
    <Modal
      open={open}
      onClose={(_e, reason) => { if (reason !== 'backdropClick') handleClose(); }}
      className="flex items-center justify-center"
    >
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Crear Fórmula de Producto</h2>
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

          <label className="block mb-2 text-sm font-medium">Cantidad de Referencia</label>
          <Input
            type="number"
            step="any"
            placeholder="Cantidad de Referencia"
            value={form.referenceQuantity}
            onChange={e => setForm({ ...form, referenceQuantity: Number(e.target.value) })}
          />

          <label className="block mb-2 text-sm font-medium">Unidad de Referencia</label>
          <Select
            options={unitsOfMeasure}
            setFormInput={(value: any) => setForm({ ...form, referenceUnitId: value })}
            styles="border rounded p-2 w-full mb-3"
            value={form.referenceUnitId}
          />

          {items.map((item: CreateProductFormulaItem, index: number) => (
            <Box key={item.id} className="border p-3 rounded mb-2 bg-gray-50">

              {/* mostrar numero de item de manera coloreada con color de fondo*/}
              <label className="block mb-2 text-sm font-medium bg-blue-100 p-2 rounded text-center">Item {index + 1}</label>
              <label className="block mb-2 text-sm font-medium">Producto</label>
              <Select
                options={products}
                setFormInput={(value: any) => setItems(items.map((i, idx) => idx === index ? { ...i, productId: value } : i))}
                styles="border rounded p-2 w-full mb-3"
              />
              <label className="block mb-2 text-sm font-medium">Unidad de Medida</label>
              <Select
                options={unitsOfMeasure}
                setFormInput={(value: any) => setItems(items.map((i, idx) => idx === index ? { ...i, unitId: value } : i))}
                styles="border rounded p-2 w-full mb-3"
              />
              <label className="block mb-2 text-sm font-medium">Cantidad</label>
              <Input type="number" step="any" placeholder="Cantidad" value={item.quantity} onChange={e => setItems(items.map((i, idx) => idx === index ? { ...i, quantity: Number(e.target.value) } : i))} />
              <Button variant="outlined" color="error" onClick={() => removeItem(index)}>Eliminar</Button>
            </Box>
          ))}

          <div className="flex justify-center mb-2">
            <Button variant="outlined" color="primary" onClick={addEmptyItem}>Agregar Producto</Button>
          </div>


          {error && <Alert type="error" boldMessage="Error: " message={error} styles="mb-4" />}

          <div className="flex justify-between mt-4">
            <Button variant="contained" color="error" onClick={handleClose}>Cancelar</Button>
            <Button variant="contained" color="success" type="submit" disabled={loading}>Agregar</Button>
          </div>
        </form>
      </Box>
    </Modal>
  )
}