import React, { createContext, useContext, useState } from 'react'
import API_BASE_URL from '../config/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = async (email, password) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        localStorage.setItem('access_token', data.access_token)
        return { success: true }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.detail || 'Error de autenticación' }
      }
    } catch (error) {
      console.error('Error:', error)
      return { success: false, error: 'Error de conexión' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('access_token')
  }

  const isAuthenticated = () => {
    return user !== null || localStorage.getItem('access_token') !== null
  }

  // Verificar token al cargar
  React.useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      // Simular usuario autenticado
      setUser({ email: 'admin@gym.com', name: 'Administrador' })
    }
  }, [])

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}