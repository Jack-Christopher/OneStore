import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Home, Package, Settings, LogOut, DollarSign, User, Tag, RulerDimensionLine } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export const MainLayout = () => {
  const navigate = useNavigate()

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate('/login')
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-800 text-white flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold p-4">OneStore</h2>
          <nav className="flex flex-col gap-2 p-4">
            <Link to="/" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><Home size={18}/> Dashboard</Link>
            <Link to="/categories" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><Tag size={18}/> Categorías</Link>
            <Link to="/unitsOfMeasure" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><RulerDimensionLine size={18}/> Unidades de Medida</Link>
            <Link to="/products" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><Package size={18}/> Productos</Link>
            <Link to="/sales" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><DollarSign size={18}/> Ventas</Link>
            <Link to="/profile" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><User size={18}/> Perfil</Link>
            <Link to="/settings" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><Settings size={18}/> Configuración</Link>
          </nav>
        </div>
        <button onClick={handleLogout} className="m-4 bg-red-600 hover:bg-red-700 py-2 rounded flex items-center justify-center gap-2">
          <LogOut size={18}/> Cerrar sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 bg-gray-100 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
