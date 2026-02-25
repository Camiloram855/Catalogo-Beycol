import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LoadingPage } from '../ui'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <LoadingPage />
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />

  return children
}
