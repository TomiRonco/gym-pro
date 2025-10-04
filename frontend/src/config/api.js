const API_BASE_URL = 'http://localhost:8001/api'

// Función helper para hacer peticiones autenticadas
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, config)
  
  // Si el token expiró, redirigir al login
  if (response.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/'
    return null
  }
  
  return response
}

export default API_BASE_URL