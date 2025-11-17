import { useNavigate } from 'react-router-dom'
import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { AuthErrorMessages } from '@/constants/authErrors';
import Alert from '@/components/Alert';


export const LoginPage = () => {
  const navigate = useNavigate();
  const loginUser = useAuthStore((s) => s.loginUser);
  const loading = useAuthStore((s) => s.loading);

  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    useAuthStore.setState({ loading: true });
    setError("")

    if (!form.email || !form.password) {
      setError("Debe completar todos los campos");
      useAuthStore.setState({ loading: false });
      return;
    }
    
    try {
      await loginUser(form)
      navigate("/")
    } catch (error: any) {
      console.error("Login error:", error);
      const code = error?.response?.data?.code;
      const msg = AuthErrorMessages[code] || "Unexpected error";
      setError(msg);
    } finally {
      useAuthStore.setState({ loading: false });
    }
  }


  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <form
        onSubmit={onSubmit}
        className="bg-white p-8 rounded-2xl shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h1>

        {error && (
          <Alert type="error" boldMessage="Error: " message={error} styles="mb-4" />
        )}

        <label className="block mb-2 text-sm font-medium">Correo electrónico</label>
        <input
          type="email"
          placeholder="Correo electrónico"
          className="border p-2 w-full rounded mb-4"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <label className="block mb-2 text-sm font-medium">Contraseña</label>
        <input
          type="password"
          placeholder="Contraseña"
          className="border p-2 w-full rounded mb-4"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />


        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white w-full py-2 rounded"
        >
          {loading ? "Cargando..." : "Iniciar sesión"}
        </button>

        <p className="text-center text-sm mt-4 text-gray-600">
          ¿Aún no tienes cuenta? <a href="/register" className="text-blue-600 hover:underline">Regístrate</a>
        </p>
      </form>
    </div>
  )
}
