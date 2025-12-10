import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Home, Package, Settings, LogOut, DollarSign, User, Tag, RulerDimensionLine, Calculator, Truck, Users, Warehouse, ShoppingCart, ChevronLeft, ChevronRight, Building2, UserCog, UserCheck, FileText, HelpCircle, BarChart3 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useEffect, useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'

export const MainLayout = () => {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { settings, fetch } = useSettingsStore()

  useEffect(() => {
    fetch()
  }, [])

  const handleLogout = () => {
    useAuthStore.getState().logout();
    navigate('/login')
  }

  const storeName = settings.store_name || 'OneStore'
  const storeLogo = settings.store_logo_path || undefined

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-primary text-primary-foreground border-r border-border flex flex-col justify-between transition-all duration-300 relative`}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-9 bg-primary text-primary-foreground rounded-full p-1 border border-border hover:bg-secondary hover:text-secondary-foreground z-50 shadow-md"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {storeLogo && (
            <div className={`flex justify-center pt-6 transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
              <img src={`${import.meta.env.VITE_API_URL}${storeLogo}`} alt="Store Logo" className={`mx-auto object-contain transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'max-w-32 max-h-32'}`} />
            </div>
          )}
          <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
            <h2 className="text-2xl font-bold p-4 text-center whitespace-nowrap">{storeName}</h2>
          </div>
          {!isCollapsed && (
            <div className="flex justify-center px-4 py-2">
              <ThemeToggle />
            </div>
          )}
          <nav className="flex flex-col gap-2 p-4">
            {(() => {
              const user = useAuthStore.getState().authUser?.user;
              const role = user?.role;

              const baseLinks = [
                { to: "/", icon: <Home size={20} />, label: "Dashboard" },
                { to: "/categories", icon: <Tag size={20} />, label: "Categorías" },
                { to: "/unitsOfMeasure", icon: <RulerDimensionLine size={20} />, label: "Unidades de Medida" },
                { to: "/products", icon: <Package size={20} />, label: "Productos" },
                { to: "/productFormulas", icon: <Calculator size={20} />, label: "Fórmulas de Productos" },
                { to: "/suppliers", icon: <Truck size={20} />, label: "Proveedores" },
                { to: "/customers", icon: <Users size={20} />, label: "Clientes" },
                { to: "/warehouses", icon: <Warehouse size={20} />, label: "Bodegas" },
                { to: "/purchaseOrders", icon: <ShoppingCart size={20} />, label: "Compras" },
                { to: "/sales", icon: <DollarSign size={20} />, label: "Ventas" },
              ];

              const adminLinks = [
                { to: "/admin/tenants", icon: <Building2 size={20} />, label: "Tenants" },
                { to: "/admin/managers", icon: <UserCog size={20} />, label: "Managers" },
              ];

              const managerLinks = [
                { to: "/manager/clerks", icon: <UserCheck size={20} />, label: "Clerks" },
              ];

              const commonLinks = [
                { to: "/stats", icon: <BarChart3 size={20} />, label: "Estadísticas" },
                { to: "/audit", icon: <FileText size={20} />, label: "Auditoría" },
                { to: "/profile", icon: <User size={20} />, label: "Perfil" },
                { to: "/settings", icon: <Settings size={20} />, label: "Configuración" },
                { to: "/support", icon: <HelpCircle size={20} />, label: "Soporte" },
              ];

              let links = [...baseLinks];

              if (role === "admin") {
                links = [...links, ...adminLinks];
              } else if (role === "manager") {
                links = [...links, ...managerLinks];
              }

              links = [...links, ...commonLinks];

              return links;
            })().map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`hover:bg-secondary hover:text-secondary-foreground rounded p-2 flex items-center gap-3 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? link.label : ''}
              >
                <div className="min-w-[20px]">{link.icon}</div>
                <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="p-4">
          <button onClick={handleLogout} className={`w-full bg-accent hover:opacity-90 text-accent-foreground py-2 rounded flex items-center gap-2 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'justify-center'}`} title="Cerrar sesión">
            <LogOut size={20} />
            <span className={`whitespace-nowrap transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 bg-background text-foreground overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
