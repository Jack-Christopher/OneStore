import { useNavigate } from 'react-router-dom'
import { useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { AuthErrorMessages } from '@/constants/authErrors';
import Alert from '@/components/Alert';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const registerUser = useAuthStore((s) => s.registerUser);
  const loading = useAuthStore((s) => s.loading);

  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
  });


  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    useAuthStore.setState({ loading: true });
    setError("")

    if (!form.email || !form.password || !form.fullname) {
      setError("Debe completar todos los campos");
      useAuthStore.setState({ loading: false });
      return;
    }

    try {
      await registerUser(form)
      navigate("/")
    } catch (error: any) {
      console.error("Register error:", error);
      const code = error?.response?.data?.code;
      const msg = AuthErrorMessages[code] || "Unexpected error";
      setError(msg);
    } finally {
      useAuthStore.setState({ loading: false });
    }
  }

  return (
    <div className="auth-page flex items-center justify-center h-screen">
      <form
        onSubmit={onSubmit}
        className="auth-card p-8 rounded-2xl shadow-md w-96"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Registrarse</h1>

        {error && (
          <Alert type="error" boldMessage="Error: " message={error} styles="mb-4" />
        )}

        <label className="block mb-2 text-sm font-medium">Nombre y apellidos</label>
        <input
          type="text"
          placeholder="Nombres y apellidos"
          className="border p-2 w-full rounded mb-4"
          value={form.fullname}
          onChange={(e) => setForm({ ...form, fullname: e.target.value })}
        />

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
          className="w-full py-2 rounded transition-opacity"
        >
          {loading ? "Cargando..." : "Registrarse"}
        </button>

        <p className="text-center text-sm mt-4 text-muted">
          ¿Ya tienes una cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </form>
    </div>
  )
}
