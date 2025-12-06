import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Home, Package, Settings, LogOut, DollarSign, User, Tag, RulerDimensionLine, Calculator, Truck, Users, Warehouse, ShoppingCart } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useEffect } from 'react'

export const MainLayout = () => {
  const navigate = useNavigate()
  const { settings, fetch } = useSettingsStore()

  useEffect(() => {
    fetch()
  }, [])

  useEffect(() => {
    // Apply theme to html element
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [settings.theme])

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate('/login')
  }

  const storeName = settings.store_name || 'OneStore'
  const storeLogo = settings.store_logo_path || undefined

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-800 text-white flex flex-col justify-between">
        <div>
          {storeLogo &&
          // center the image
          <div className="flex justify-center pt-6">
            <img src={`${import.meta.env.VITE_API_URL}${storeLogo}`} alt="Store Logo" className="mx-auto object-contain max-w-32 max-h-32" />
          </div>
          }
          <h2 className="text-2xl font-bold p-4">{storeName}</h2>
          <nav className="flex flex-col gap-2 p-4">
            <Link to="/" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><Home size={18} /> Dashboard</Link>
            <Link to="/categories" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><Tag size={18} /> Categorías</Link>
            <Link to="/unitsOfMeasure" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><RulerDimensionLine size={18} /> Unidades de Medida</Link>
            <Link to="/products" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><Package size={18} /> Productos</Link>
            <Link to="/productFormulas" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><Calculator size={18} /> Fórmulas de Productos</Link>
            <Link to="/suppliers" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><Truck size={18} /> Proveedores</Link>
            <Link to="/customers" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><Users size={18} /> Clientes</Link>
            <Link to="/warehouses" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><Warehouse size={18} /> Bodegas</Link>
            <Link to="/purchaseOrders" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><ShoppingCart size={18} /> Compras</Link>
            <Link to="/sales" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><DollarSign size={18} /> Ventas</Link>
            <Link to="/profile" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><User size={18} /> Perfil</Link>
            <Link to="/settings" className="hover:bg-slate-700 rounded p-2 flex items-center gap-2"><Settings size={18} /> Configuración</Link>
          </nav>
        </div>
        <button onClick={handleLogout} className="m-4 bg-red-600 hover:bg-red-700 py-2 rounded flex items-center justify-center gap-2">
          <LogOut size={18} /> Cerrar sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 bg-gray-100 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
