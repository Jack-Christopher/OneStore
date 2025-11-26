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

interface ProductsCreateModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProductsCreateModal({ open, onClose }: ProductsCreateModalProps) {
  const addProduct = useProductsStore(s => s.add);
  const { items: categoryItems, fetch: fetchCategories } = useCategoriesStore();
  const { items: unitsOfMeasureItems, fetch: fetchUnitsOfMeasure } = useUnitsOfMeasureStore();
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateProductPayload>({
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
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<SelectOption[]>([]);

  const toSelectOption = (category: Category) => {
    return {
      value: category._id,
      label: category.name
    }
  }

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

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true);
    setError("")

    if (!form.name || !form.sku || !form.purchasePrice || !form.salePrice || !form.minStock || !form.maxStock || !form.description) {
      setError("Debe completar todos los campos");
      setLoading(false);
      return;
    }

    try {
      await addProduct(form)
      onClose();
    } catch (error: any) {
      console.log(JSON.stringify(error, null, 2));
      console.error("Create product error:", error);
      const code = error?.response?.data?.code;
      const msg = ProductsErrorMessages[code] || "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center" >
      <Box sx={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: 24,
        width: 400,
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Crear Producto</h2>
        <form className="flex flex-col" onSubmit={onSubmit}>
          <input type="text" placeholder="Nombre" className="border rounded p-2 w-full mb-3" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

          <Select
            options={categories}
            setFormInput={(value) => setForm({ ...form, categoryId: value })}
            styles="border rounded p-2 w-full mb-3"
          />

          <Select
            options={unitsOfMeasure}
            setFormInput={(value) => setForm({ ...form, unitId: value })}
            styles="border rounded p-2 w-full mb-3"
          />

          <input type="text" placeholder="SKU" className="border rounded p-2 w-full mb-3" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
          <input type="number" placeholder="Precio de Compra" step="0.1" className="border rounded p-2 w-full mb-3" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: parseFloat(e.target.value) })} />
          <input type="number" placeholder="Precio de Venta" step="0.1" className="border rounded p-2 w-full mb-3" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: parseFloat(e.target.value) })} />
          <input type="number" placeholder="Stock Mínimo" className="border rounded p-2 w-full mb-3" value={form.minStock} onChange={e => setForm({ ...form, minStock: +e.target.value })} />
          <input type="number" placeholder="Stock Máximo" className="border rounded p-2 w-full mb-3" value={form.maxStock} onChange={e => setForm({ ...form, maxStock: +e.target.value })} />

          <input type="text" placeholder="Descripcion" className="border rounded p-2 w-full mb-3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          {error && <Alert type="error" boldMessage="Error: " message={error} styles="mb-4" />}

          <div className="flex justify-between mt-4">
            <Button variant="contained" color="error" onClick={onClose}>Cancelar</Button>
            <Button variant="contained" color="primary" type="submit" disabled={loading}>Agregar</Button>
          </div>
        </form>
      </Box>
    </Modal>
  )
}