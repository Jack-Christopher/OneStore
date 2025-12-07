import { useEffect, useState } from "react";
import { Box, Button, Modal } from "@mui/material"
import Alert from "@/components/Alert";
import { getClerks, updateClerk, type Clerk, type UpdateClerkPayload } from "@/services/api/manager";

interface ManagerClerksEditModalProps {
  open: boolean;
  onClose: () => void;
  clerkId: string | null;
}

export default function ManagerClerksEditModal({ open, onClose, clerkId }: ManagerClerksEditModalProps) {
  const [error, setError] = useState("");
  const [clerk, setClerk] = useState<Clerk | null>(null);
  const [form, setForm] = useState<UpdateClerkPayload>({
    username: "",
    email: "",
    full_name: "",
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (clerkId && clerkId !== null) {
      getClerks()
        .then((res) => {
          if (res.success) {
            const found = res.data.find((c: Clerk) => c._id === clerkId)
            if (found) {
              setClerk(found)
              setForm({
                username: found.username || "",
                email: found.email || "",
                full_name: found.full_name || "",
                is_active: found.is_active,
              })
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching clerk:", err)
        })
    }
  }, [clerkId])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setLoading(true);
    setError("")

    if (!form.username || !form.email) {
      setError("Debe completar todos los campos requeridos");
      setLoading(false);
      return;
    }

    try {
      const res = await updateClerk(clerkId as string, form);
      if (res.success) {
        onClose();
      } else {
        setError(res.message || "Error al actualizar clerk");
      }
    } catch (error: any) {
      console.error("Edit clerk error:", error);
      setError(error?.response?.data?.message || "Error al actualizar clerk");
    } finally {
      setLoading(false);
    }
  }
  
  if (loading && !clerk) return <p>Cargando...</p>

  return (
    <Modal open={open} onClose={onClose} className="flex items-center justify-center" >
      <Box sx={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: 24,
        width: 500,
      }}>
        <h2 className="text-2xl font-bold mb-4 text-center">Editar Clerk</h2>
        <form className="flex flex-col" onSubmit={onSubmit}>
          <label className="block mb-2 text-sm font-medium">Usuario *</label>
          <input type="text" placeholder="Usuario" className="border rounded p-2 w-full mb-3" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          
          <label className="block mb-2 text-sm font-medium">Email *</label>
          <input type="email" placeholder="Email" className="border rounded p-2 w-full mb-3" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          
          <label className="block mb-2 text-sm font-medium">Nombre Completo</label>
          <input type="text" placeholder="Nombre Completo" className="border rounded p-2 w-full mb-3" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />

          <label className="block mb-2 text-sm font-medium">Estado</label>
          <select 
            className="border rounded p-2 w-full mb-3" 
            value={form.is_active ? "true" : "false"} 
            onChange={e => setForm({ ...form, is_active: e.target.value === "true" })}
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>

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

