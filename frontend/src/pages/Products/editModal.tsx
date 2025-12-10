import { Box, Button, Modal } from "@mui/material"
import Input from "@/components/Input"
import { useEffect, useState } from "react";
import type { Product, UpdateProductPayload } from "@/services/api/products";
import { getProduct, updateProduct } from "@/services/api/products";
import { useAuthStore } from "@/store/authStore";
import Select, { type SelectOption } from "@/components/Select";
import type { Category } from "@/services/api/categories";
import type { UnitOfMeasure } from "@/services/api/unitsOfMeasure";
import { useUnitsOfMeasureStore } from "@/store/unitsOfMeasureStore";
import { useCategoriesStore } from "@/store/categoriesStore";
import { ProductsErrorMessages } from "@/constants/productsErrors";
import Alert from "@/components/Alert";

interface ProductsEditModalProps {
    open: boolean;
    onClose: () => void;
    productId: string | null;
    onSuccess?: () => void;
}

export default function ProductsEditModal({ open, onClose, productId, onSuccess }: ProductsEditModalProps) {
    const [product, setProduct] = useState<Product | null>(null);
    const [error, setError] = useState("");
    const [form, setForm] = useState<UpdateProductPayload>({
        tenantId: useAuthStore.getState().authUser?.user?.tenantId || "orphan",
        categoryId: product?.categoryId?._id || "",
        unitId: product?.unitId?._id || "",
        name: product?.name || "",
        sku: product?.sku || "",
        purchasePrice: product?.purchase_price || 0,
        salePrice: product?.sale_price || 0,
        minStock: product?.min_stock || 0,
        maxStock: product?.max_stock || 0,
        description: product?.description || "",
    });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<SelectOption[]>([]);   
    const [unitsOfMeasure, setUnitsOfMeasure] = useState<SelectOption[]>([]);

    const { items: categoryItems, fetch: fetchCategories } = useCategoriesStore();
    const { items: unitsOfMeasureItems, fetch: fetchUnitsOfMeasure } = useUnitsOfMeasureStore();

    useEffect(() => {
        fetchCategories().then(() => {
            setCategories(categoryItems.map((ci: Category) => toSelectOption(ci)));
        }).catch((err) => {
            console.error("Error fetching categories:", err);
            setCategories([]);
        });

        fetchUnitsOfMeasure().then(() => {
            setUnitsOfMeasure(unitsOfMeasureItems.map((uomi: UnitOfMeasure) => toSelectOption(uomi)));
        }).catch((err) => {
            console.error("Error fetching units of measure:", err);
            setUnitsOfMeasure([]);
        });
    }, []);

    const toSelectOption = (obj: Category | UnitOfMeasure) => {
        return {
          value: obj._id,
          label: obj.name
        }
      }
      
    const [initialForm, setInitialForm] = useState<UpdateProductPayload | null>(null);

    useEffect(() => {
        if (productId) {
            getProduct(productId)
            .then((res) => {
                setProduct(res.data)
                const initialData = {
                    name: res.data?.name || "",
                    categoryId: res.data?.category_id?._id || "",
                    unitId: res.data?.unit_id?._id || "",
                    description: res.data?.description || "",
                    sku: res.data?.sku || "",
                    purchasePrice: res.data?.purchase_price || 0,
                    salePrice: res.data?.sale_price || 0,
                    minStock: res.data?.min_stock || 0,
                    maxStock: res.data?.max_stock || 0,
                };
                setForm(initialData);
                setInitialForm(initialData);
            })
        }
    }, [productId]);

    const resetForm = () => {
        if (initialForm) {
            setForm(initialForm);
        }
        setError("");
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        if (!form.name || !form.description || !form.sku || !form.purchasePrice || !form.salePrice || !form.minStock || !form.maxStock) {
            setError("Todos los campos son requeridos");
            setLoading(false);
            return;
        }
        try {
            await updateProduct(productId as string, form);
            resetForm();
            onClose();
            // Trigger refresh after successful update
            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error("Error updating product:", error);
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
    };

    if (loading) return <p>Cargando...</p>

    return (
        <Modal 
            open={open} 
            onClose={(e, reason) => { if (reason !== 'backdropClick') handleClose(); }} 
            className="flex items-center justify-center" 
        >
            <Box sx={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '0.5rem',
                boxShadow: 24,
                width: 400,
            }}>
                <h2 className="text-2xl font-bold mb-4 text-center">Editar Producto</h2>
                <form className="flex flex-col" onSubmit={onSubmit}>
                    <label className="block mb-2 text-sm font-medium">Nombre</label>
                    <Input type="text" placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                    <label className="block mb-2 text-sm font-medium">Categoría</label>
                    <Select options={categories} value={form.categoryId || ""} setFormInput={(value: any) => setForm({ ...form, categoryId: value })} styles="border rounded p-2 w-full mb-3" />
                    <label className="block mb-2 text-sm font-medium">Unidad</label>
                    <Select options={unitsOfMeasure} value={form.unitId || ""} setFormInput={(value: any) => setForm({ ...form, unitId: value })} styles="border rounded p-2 w-full mb-3" />
                    <label className="block mb-2 text-sm font-medium">Descripción</label>
                    <Input type="text" placeholder="Descripción" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                    <label className="block mb-2 text-sm font-medium">SKU</label>
                    <Input type="text" placeholder="SKU" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                    <label className="block mb-2 text-sm font-medium">Precio de compra</label>
                    <Input type="number" placeholder="Precio de compra" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: Number(e.target.value) })} />
                    <label className="block mb-2 text-sm font-medium">Precio de venta</label>
                    <Input type="number" placeholder="Precio de venta" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: Number(e.target.value) })} />
                    <label className="block mb-2 text-sm font-medium">Stock mínimo</label>
                    <Input type="number" placeholder="Stock mínimo" value={form.minStock} onChange={e => setForm({ ...form, minStock: Number(e.target.value) })} />
                    <label className="block mb-2 text-sm font-medium">Stock máximo</label>
                    <Input type="number" placeholder="Stock máximo" value={form.maxStock} onChange={e => setForm({ ...form, maxStock: Number(e.target.value) })} />
                    
                    {error && <Alert type="error" message={error} styles="mb-4 mt-4" />}
                </form>
                <div className="flex justify-between mt-4">
                    <Button variant="contained" color="error" onClick={handleClose}>Cancelar</Button>
                    <Button variant="contained" color="primary" type="submit" onClick={(e: React.MouseEvent<HTMLButtonElement>) => onSubmit(e)} disabled={loading}>Guardar</Button>
                </div>
            </Box>
        </Modal>
    )
}
