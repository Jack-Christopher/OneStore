import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import DashboardPage from '@/pages/Dashboard'
import ProductsPage from '@/pages/Products'
import SalesPage from '@/pages/Sales'
import SettingsPage from '@/pages/Settings'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { MainLayout } from '@/layouts/MainLayout'
import { ProfilePage } from '@/pages/ProfilePage'
import { PublicRoute } from './PublicRoutes'
import { PrivateRoute } from '@/routes/PrivateRoute'
import CategoriesPage from '@/pages/Categories'
import UnitsOfMeasurePage from '@/pages/UnitsOfMeasure'
import ProductFormulas from '@/pages/ProductFormulas'
import SuppliersPage from '@/pages/Suppliers'
import CustomersPage from '@/pages/Customers'
import WarehousesPage from '@/pages/Warehouses'
import PurchaseOrdersPage from '@/pages/PurchaseOrders'
import AdminTenantsPage from '@/pages/AdminTenants'
import AdminManagersPage from '@/pages/AdminManagers'
import ManagerClerksPage from '@/pages/ManagerClerks'

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="unitsOfMeasure" element={<UnitsOfMeasurePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="productFormulas" element={<ProductFormulas />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="warehouses" element={<WarehousesPage />} />
        <Route path="purchaseOrders" element={<PurchaseOrdersPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="admin/tenants" element={<AdminTenantsPage />} />
        <Route path="admin/managers" element={<AdminManagersPage />} />
        <Route path="manager/clerks" element={<ManagerClerksPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
)
