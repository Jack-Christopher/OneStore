import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
// import { DashboardPage } from '@/pages/DashboardPage'
// import { ProductsPage } from '@/pages/ProductsPage'
// import { SalesPage } from '@/pages/SalesPage'
// import { SettingsPage } from '@/pages/SettingsPage'
// import { NotFoundPage } from '@/pages/NotFoundPage'
import { MainLayout } from '@/layouts/MainLayout'
import { PrivateRoute } from '@/routes/PrivateRoute'

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        {/* <Route index element={<DashboardPage />} /> */}
        {/* <Route path="products" element={<ProductsPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="settings" element={<SettingsPage />} /> */}
      </Route>
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  </BrowserRouter>
)
