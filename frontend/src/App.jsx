import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

// Public
import PublicLayout from './components/public/Layout'
import HomePage from './pages/public/HomePage'
import CatalogPage from './pages/public/CatalogPage'
import ProductDetailPage from './pages/public/ProductDetailPage'

// Admin
import AdminLayout from './components/admin/AdminLayout'
import ProtectedRoute from './components/admin/ProtectedRoute'
import LoginPage from './pages/admin/LoginPage'
import DashboardPage from './pages/admin/DashboardPage'
import ProductsAdminPage from './pages/admin/ProductsAdminPage'
import CategoriesAdminPage from './pages/admin/CategoriesAdminPage'
import SiteTextsAdminPage from './pages/admin/SiteTextsAdminPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
        </Route>

        {/* Admin - Login (no auth required) */}
        <Route path="/admin/login" element={<LoginPage />} />

        {/* Admin - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="productos" element={<ProductsAdminPage />} />
          <Route path="categorias" element={<CategoriesAdminPage />} />
          <Route path="textos" element={<SiteTextsAdminPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
