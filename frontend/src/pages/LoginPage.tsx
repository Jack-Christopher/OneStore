import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(4).required()
})

export const LoginPage = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = (data: any) => {
    if (data.email === 'admin@onestore.com' && data.password === '1234') {
      localStorage.setItem('onestore_token', 'mock_token')
      toast.success('Bienvenido a OneStore')
      navigate('/')
    } else {
      toast.error('Credenciales inválidas')
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">OneStore Login</h1>

        <label className="block mb-2 text-sm font-medium">Correo electrónico</label>
        <input {...register('email')} type="email" className="border p-2 w-full rounded" placeholder="admin@onestore.com" />
        <p className="text-red-500 text-sm">{errors.email?.message}</p>

        <label className="block mb-2 text-sm font-medium mt-4">Contraseña</label>
        <input {...register('password')} type="password" className="border p-2 w-full rounded" placeholder="••••••" />
        <p className="text-red-500 text-sm">{errors.password?.message}</p>

        <button type="submit" className="bg-blue-600 hover:bg-blue-700 w-full text-white py-2 rounded mt-6">Iniciar sesión</button>

        <p className="text-center text-sm mt-4 text-gray-600">
          ¿No tienes cuenta? <a href="/register" className="text-blue-600 hover:underline">Regístrate</a>
        </p>
      </form>
    </div>
  )
}
