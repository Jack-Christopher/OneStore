import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
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

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
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
        <Route path="sales" element={<SalesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
)
