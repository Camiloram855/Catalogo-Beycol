import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

    useEffect(() => {
      const token = localStorage.getItem('admin_token')

      if (token) {
        authService.me()
          .then((data) => setUser(data)) // 👈 CAMBIO AQUÍ
          .catch(() => localStorage.removeItem('admin_token'))
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }, [])

      const login = async (credentials) => {
        const data = await authService.login(credentials)
        localStorage.setItem('admin_token', data.token)
        setUser(data.user)
        return data
      }

  const logout = async () => {
    try { await authService.logout() } catch (_) {}
    localStorage.removeItem('admin_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
