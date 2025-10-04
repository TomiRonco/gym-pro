const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api'

// Función helper para hacer peticiones autenticadas
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('access_token')
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, config)
  
  // Si el token expiró, limpiar el storage y permitir que el AuthContext maneje el logout
  if (response.status === 401) {
    localStorage.removeItem('access_token')
    // No hacer redirect directo, dejar que la aplicación lo maneje
    return null
  }
  
  return response
}

export default API_BASE_URL