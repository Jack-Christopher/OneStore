import Input from "@/components/Input";
import type { SelectOption } from "@/components/Select";
import Select from "@/components/Select";
import { ProductFormulasErrorMessages } from "@/constants/productFormulasErrors";
import { getProductFormula, updateProductFormula } from "@/services/api/productFormulas";
import type { Product } from "@/services/api/products";
import type { UnitOfMeasure } from "@/services/api/unitsOfMeasure";
import { useAuthStore } from "@/store/authStore";
import { useProductsStore } from "@/store/productsStore";
import { useUnitsOfMeasureStore } from "@/store/unitsOfMeasureStore";
import { Box, Button, Modal } from "@mui/material";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

interface ProductFormulasEditModalProps {
  open: boolean;
  onClose: () => void;
  productFormulaId: string | null;
}

interface EditItem {
  id: string;
  productId: string;
  unitId: string;
  quantity: number;
}

export default function ProductFormulasEditModal({ open, onClose, productFormulaId }: ProductFormulasEditModalProps) {
  const [form, setForm] = useState({
    tenantId: useAuthStore.getState().authUser?.user?.tenantId || "orphan",
    name: "",
    description: "",
  });
  const [items, setItems] = useState<EditItem[]>([]);
  const [error, setError] = useState("");
  const { items: productItems, fetch: fetchProducts } = useProductsStore();
  const { items: unitOfMeasureItems, fetch: fetchUnitsOfMeasure } = useUnitsOfMeasureStore();
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);

  const toSelectOption = (obj: Product | UnitOfMeasure): SelectOption => {
    return {
      value: obj._id,
      label: obj.name,
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
    if (open && productFormulaId) {
      getProductFormula(productFormulaId).then((res) => {
        console.log("productFormula", res);
        if (res.success) {
          setForm({
            tenantId: useAuthStore.getState().authUser?.user?.tenantId || "orphan",
            name: res.data?.name || "",
            description: res.data?.description || "",
          });
          // Transform API response items (which may have populated objects) to EditItem format
          if (res.data?.items) {
            const transformedItems: EditItem[] = res.data.items.map((item: any) => ({
              id: uuidv4(),
              productId: typeof item.product_id === 'object' ? item.product_id._id : (item.productId || item.product_id || ""),
              unitId: typeof item.unit_id === 'object' ? item.unit_id._id : (item.unitId || item.unit_id || ""),
              quantity: item.quantity || 0,
            }));
            setItems(transformedItems);
          }
        } else {
          console.error("Error fetching product formula:", res.message);
          setError(res.message || "Error al obtener la fórmula de producto");
        }
      });
    } else if (!open) {
      // Reset form when modal closes
      setForm({
        tenantId: useAuthStore.getState().authUser?.user?.tenantId || "orphan",
        name: "",
        description: "",
      });
      setItems([]);
      setError("");
    }
  }, [open, productFormulaId]);

  useEffect(() => {
    if (open) {
      fetchProducts().then(() => {
        setProducts(productItems.map((pi) => toSelectOption(pi)));
      }).catch((err) => {
        console.error("Error fetching products:", err);
      });

      fetchUnitsOfMeasure().then(() => {
        setUnitsOfMeasure(unitOfMeasureItems.map((uomi => toSelectOption(uomi))));
      }).catch((err) => {
        console.error("Error fetching units of measure:", err);
      });
    }
  }, [open]);

  const addEmptyItem = () => {
    setItems(prev => [...prev, { id: uuidv4(), productId: "", unitId: "", quantity: 0 }]);
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.name || !form.description) {
      setError("Debe completar todos los campos");
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
      const payload = {
        ...form,
        items: items.map(item => ({
          productId: item.productId,
          unitId: item.unitId,
          quantity: item.quantity,
        }))
      };
      await updateProductFormula(productFormulaId!, payload);
      onClose();
    } catch (error: any) {
      console.error("Error updating product formula:", error);
      const code = error?.response?.data?.code || "unexpected_error";
      const msg = ProductFormulasErrorMessages[code] || "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center">
      <Box sx={boxStyle}>
        <h2 className="text-2xl font-bold mb-4 text-center">Editar Fórmula de Producto</h2>
        <form className="flex flex-col" onSubmit={onSubmit}>
          <label className="block mb-2 text-sm font-medium">Nombre</label>
          <Input type="text" placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <label className="block mb-2 text-sm font-medium">Descripción</label>
          <textarea placeholder="Descripción" className="border rounded p-2 w-full mb-3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          {items.map((item: EditItem, index: number) => (
            <Box key={item.id} className="border p-3 rounded mb-2 bg-gray-50">
              <label className="block mb-2 text-sm font-medium bg-blue-100 p-2 rounded text-center">Item {index + 1}</label>
              <label className="block mb-2 text-sm font-medium">Producto</label>
              <Select
                options={products}
                styles="border rounded p-2 w-full mb-3"
                setFormInput={(value: any) => setItems(items.map((i, idx) => idx === index ? { ...i, productId: value } : i))}
                value={item.productId || ""}
              />
              <label className="block mb-2 text-sm font-medium">Unidad de Medida</label>
              <Select
                options={unitsOfMeasure}
                styles="border rounded p-2 w-full mb-3"
                setFormInput={(value: any) => setItems(items.map((i, idx) => idx === index ? { ...i, unitId: value } : i))}
                value={item.unitId || ""}
              />
              <label className="block mb-2 text-sm font-medium">Cantidad</label>
              <Input type="number" placeholder="Cantidad" value={item.quantity} onChange={e => setItems(items.map((i, idx) => idx === index ? { ...i, quantity: Number(e.target.value) } : i))} />
              <Button variant="outlined" color="error" onClick={() => removeItem(index)} className="mt-2">Eliminar</Button>
            </Box>
          ))}
          <div className="flex justify-center mb-2">
            <Button variant="outlined" color="primary" onClick={addEmptyItem}>Agregar Producto</Button>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-between mt-4">
            <Button variant="contained" color="error" type="button" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button variant="contained" color="primary" type="submit" disabled={loading}>Guardar</Button>
          </div>
        </form>
      </Box>
    </Modal>
  )
}