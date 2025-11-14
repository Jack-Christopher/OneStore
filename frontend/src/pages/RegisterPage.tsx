import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const schema = yup.object({
  name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().min(4).required()
})

export const RegisterPage = () => {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) })

  const onSubmit = (data: any) => {
    localStorage.setItem('onestore_user', JSON.stringify(data))
    toast.success('Usuario registrado (mock)')
    navigate('/login')
  }

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Registro OneStore</h1>

        <label className="block mb-2 text-sm font-medium">Nombre</label>
        <input {...register('name')} className="border p-2 w-full rounded" />
        <p className="text-red-500 text-sm">{errors.name?.message}</p>

        <label className="block mb-2 text-sm font-medium mt-4">Correo electrónico</label>
        <input {...register('email')} className="border p-2 w-full rounded" />
        <p className="text-red-500 text-sm">{errors.email?.message}</p>

        <label className="block mb-2 text-sm font-medium mt-4">Contraseña</label>
        <input {...register('password')} type="password" className="border p-2 w-full rounded" />
        <p className="text-red-500 text-sm">{errors.password?.message}</p>

        <button type="submit" className="bg-green-600 hover:bg-green-700 w-full text-white py-2 rounded mt-6">Registrarse</button>

        <p className="text-center text-sm mt-4 text-gray-600">
          ¿Ya tienes cuenta? <a href="/login" className="text-blue-600 hover:underline">Inicia sesión</a>
        </p>
      </form>
    </div>
  )
}
