import { useEffect, useState } from "react";
import { useCategoriesStore } from "@/store/categoriesStore";
import { useAuthStore } from "@/store/authStore";
import { Box, Button, Modal } from "@mui/material"
import { CategoriesErrorMessages } from "@/constants/categoriesErrors";
import Alert from "@/components/Alert";
import { getCategory, type Category, type UpdateCategoryPayload } from "@/services/api/categories";
import type { ApiResponse } from "@/types/api";

interface CategoriesEditModalProps {
  open: boolean;
  onClose: () => void;
  categoryId: string | null;
}

export default function CategoriesEditModal({ open, onClose, categoryId }: CategoriesEditModalProps) {
  const editCategory = useCategoriesStore(s => s.edit);
  const [error, setError] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<UpdateCategoryPayload>({
    tenantId: useAuthStore.getState().authUser?.user?.tenantId || "orphan",
    name: category?.name || "",
    description: category?.description || "",
  });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (categoryId && categoryId !== null) {
      console.log("fetching category", categoryId)
      getCategory(categoryId)
        .then((res: ApiResponse<Category>) => {
          if (res.success) {
            setCategory(res.data)
            setForm({
              tenantId: useAuthStore.getState().authUser?.user?.tenantId || "orphan",
              name: res.data?.name ?? "",
              description: res.data?.description ?? "",
            })
          }
        })
    }
  }, [categoryId])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true);
    setError("")

    if (!form.name || !form.description) {
      setError("Debe completar todos los campos");
      setLoading(false);
      return;
    }

    try {
      await editCategory(categoryId as string, form)
      onClose();
    } catch (error: any) {
      console.error("Edit category error:", error);
      const code = error?.response?.data?.code;
      const msg = CategoriesErrorMessages[code] || "Unexpected error";
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
        <h2 className="text-2xl font-bold mb-4 text-center">Editar Categoría</h2>
        <form className="flex flex-col" onSubmit={onSubmit}>
          <label className="block mb-2 text-sm font-medium">Nombre</label>
          <input type="text" placeholder="Nombre" className="border rounded p-2 w-full mb-3" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <label className="block mb-2 text-sm font-medium">Descripción</label>
          <textarea placeholder="Descripción" className="border rounded p-2 w-full mb-3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

          {error && <Alert type="error" boldMessage="Error: " message={error} styles="mb-4" />}

          <div className="flex justify-between mt-4">
            <Button variant="contained" color="error" onClick={onClose}>Cancelar</Button>
            <Button variant="contained" color="primary" type="submit" disabled={loading}>Guardar</Button>
          </div>
        </form>
      </Box>
    </Modal>
  )
}