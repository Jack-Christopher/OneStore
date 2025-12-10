import { useEffect, useState } from "react";
import { useProductsStore } from "@/store/productsStore";
import { useAuthStore } from "@/store/authStore";
import { Box, Button, Modal } from "@mui/material"
import { ProductsErrorMessages } from "@/constants/productsErrors";
import Alert from "@/components/Alert";
import Select, { type SelectOption } from "@/components/Select";
import { useCategoriesStore } from "@/store/categoriesStore";
import type { Category } from "@/services/api/categories";
import type { CreateProductPayload } from "@/services/api/products";
import { useUnitsOfMeasureStore } from "@/store/unitsOfMeasureStore";
import Input from "@/components/Input";
import { trimStringValues, createTrimmedBlurHandler } from "@/utils/formUtils";

interface ProductsCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ProductsCreateModal({ open, onClose, onSuccess }: ProductsCreateModalProps) {
  const addProduct = useProductsStore(s => s.add);
  const { items: categoryItems, fetch: fetchCategories } = useCategoriesStore();
  const { items: unitsOfMeasureItems, fetch: fetchUnitsOfMeasure } = useUnitsOfMeasureStore();
  const [error, setError] = useState("");
  const initialForm: CreateProductPayload = {
    tenantId: useAuthStore.getState().authUser?.user?.tenantId || "orphan",
    categoryId: "",
    unitId: "",
    name: "",
    sku: "",
    purchasePrice: 0,
    salePrice: 0,
    minStock: 0,
    maxStock: 0,
    description: "",
  };
  const [form, setForm] = useState<CreateProductPayload>(initialForm);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<SelectOption[]>([]);

  const toSelectOption = (category: Category) => {
    return {
      value: category._id,
      label: category.name
    }
  }

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

  useEffect(() => {
    console.log("form", form);
  }, [form]);

  useEffect(() => {
    fetchCategories()
      .then(() => {
        setCategories(categoryItems.map((ci) => toSelectOption(ci)));
      });
    fetchUnitsOfMeasure()
      .then(() => {
        setUnitsOfMeasure(unitsOfMeasureItems.map((uomi) => toSelectOption(uomi)));
      });
  }, [])

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

    if (!form.name || !form.sku || !form.purchasePrice || !form.salePrice || !form.minStock || !form.maxStock || !form.description) {
      setError("Debe completar todos los campos");
      setLoading(false);
      return;
    }

    if (!form.categoryId || form.categoryId === "") {
      setError("Categoría requerida");
      setLoading(false);
      return;
    }

    if (!form.unitId || form.unitId === "") {
      setError("Unidad de medida requerida");
      setLoading(false);
      return;
    }

    if (!form.purchasePrice || form.purchasePrice <= 0) {
      setError("Precio de compra debe ser mayor a 0");
      setLoading(false);
      return;
    }

    if (!form.salePrice || form.salePrice <= 0) {
      setError("Precio de venta debe ser mayor a 0");
      setLoading(false);
      return;
    }

    if (!form.minStock || form.minStock <= 0) {
      setError("Stock mínimo debe ser mayor a 0");
      setLoading(false);
      return;
    }

    if (!form.maxStock || form.maxStock <= 0) {
      setError("Stock máximo debe ser mayor a 0");
      setLoading(false);
      return;
    }

    try {
      // Trim all string values before submitting
      const trimmedForm = trimStringValues(form);
      await addProduct(trimmedForm)
      resetForm();
      onClose();
      // Trigger refresh after successful creation
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.log(JSON.stringify(error, null, 2));
      console.error("Create product error:", error);
      // Use the parsed error from axios interceptor or parse it ourselves
      const errorMessage = error?.userMessage || error?.parsedError?.message || error?.response?.data?.message;
      const errorCode = error?.errorCode || error?.parsedError?.code || error?.response?.data?.code;
      
      // Try to get message from error constants first, then use parsed message
      const msg = errorCode && ProductsErrorMessages[errorCode] 
        ? ProductsErrorMessages[errorCode] 
        : errorMessage || "Ocurrió un error inesperado";
      setError(msg);
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
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Crear Producto</h2>
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

          <label className="block mb-2 text-sm font-medium">Categoría</label>
          <Select
            options={categories}
            setFormInput={(value) => setForm({ ...form, categoryId: value })}
            styles="border rounded p-2 w-full mb-3"
          />

          <label className="block mb-2 text-sm font-medium">Unidad de Medida</label>
          <Select
            options={unitsOfMeasure}
            setFormInput={(value) => setForm({ ...form, unitId: value })}
            styles="border rounded p-2 w-full mb-3"
          />

          <label className="block mb-2 text-sm font-medium">SKU</label>
          <Input
            type="text"
            placeholder="SKU"
            value={form.sku}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, sku: e.target.value })}
            onBlur={createTrimmedBlurHandler(setForm, 'sku')}
          />
          <label className="block mb-2 text-sm font-medium">Precio de Compra</label>
          <Input
            type="number"
            placeholder="Precio de Compra"
            step={0.1}
            value={form.purchasePrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, purchasePrice: parseFloat(e.target.value) })}
          />
          <label className="block mb-2 text-sm font-medium">Precio de Venta</label>
          <Input
            type="number"
            placeholder="Precio de Venta"
            step={0.1}
            value={form.salePrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, salePrice: parseFloat(e.target.value) })}
          />
          <label className="block mb-2 text-sm font-medium">Stock Mínimo</label>
          <Input
            type="number"
            placeholder="Stock Mínimo"
            value={form.minStock}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, minStock: +e.target.value })}
          />
          <label className="block mb-2 text-sm font-medium">Stock Máximo</label>
          <Input
            type="number"
            placeholder="Stock Máximo"
            value={form.maxStock}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, maxStock: +e.target.value })}
          />
          <label className="block mb-2 text-sm font-medium">Descripción</label>
          <textarea 
            placeholder="Descripción" 
            className="border rounded p-2 w-full mb-3" 
            value={form.description} 
            onChange={e => setForm({ ...form, description: e.target.value })}
            onBlur={createTrimmedBlurHandler(setForm, 'description')}
          />

          {error && <Alert type="error" message={error} styles="mb-4" />}

          <div className="flex justify-between mt-4">
            <Button variant="contained" color="error" onClick={handleClose}>Cancelar</Button>
            <Button variant="contained" color="primary" type="submit" disabled={loading}>Agregar</Button>
          </div>
        </form>
      </Box>
    </Modal>
  )
}